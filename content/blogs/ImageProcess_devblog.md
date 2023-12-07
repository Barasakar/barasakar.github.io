---
title: "Dev Blog for Image Processing Project:"
description: "This blog records some of the interesting stuff I noticed during my development for an Image Processing software that is based on C++."
tags: ["Image Processing", "Dev Blog"]
draft: false
---
## 2023-11-28
### Contouring Development:
The contouring implementation that I was working on is based on the Marching Squares algorithm. The square data structure I design contains the following information:
```c++
struct PixelBlock {
			int x1, y1, x2, y2, x3, y3, x4, y4; // this is the coordinate of the corners in a 2x2 pixel block.
			bool topLeft, topRight, bottomLeft, bottomRight; // Edge cases flags;
			int values[4]; // an array to store pixel values in the pixel block.
		};
```
This square (or `PixelBlock` object) will be going through a greyscale image and the following code will update the fields in the `PixelBlock` object:

```c++
void imageProcessing::Contouring::march(QImage& image) {
	for (int y = 0; y < image.height() - 1; y++) {
		for (int x = 0; x < image.width() - 1; x++) {
			PixelBlock block;

			block.topLeft = (qRed(image.pixel(x, y)) == 255);
			block.topRight = (qRed(image.pixel(x + 1, y)) == 255);
			block.bottomLeft = (qRed(image.pixel(x, y + 1)) == 255);
			block.bottomRight = (qRed(image.pixel(x + 1, y + 1)) == 255);

			//top-left
			block.x1 = x;
			block.y1 = y;
			
			//top-right
			block.x2 = x + 1;
			block.y2 = y;
			
			//bootom-left
			block.x3 = x;
			block.y3 = y + 1;
			
			//bottom-right
			block.x4 = x + 1;
			block.y4 = y + 1;

			block.values[0] = qRed(image.pixel(x, y));
			block.values[1] = qRed(image.pixel(x + 1, y));
			block.values[2] = qRed(image.pixel(x, y + 1));
			block.values[3] = qRed(image.pixel(x + 1, y + 1));

			getLines(block);
		}
	}
	
}
```

Based on the information stored in the square, my implementation will create a look-up table for the edge cases, and based on these edges, I used the linear interpolation to calculate the intersection points to form the contours. Since the image is binarized, for the linear interpolation, I calculated the midpoints between two given points. 

```c++
int imageProcessing::Contouring::getEdgeCase(const PixelBlock& block) const {

	if (block.topLeft && block.topRight && block.bottomLeft && block.bottomRight) {
		return 0;
	}
	if (block.topLeft && block.topRight && !block.bottomLeft && block.bottomRight) {
		return 1;
	}
	if (block.topLeft && block.topRight && block.bottomLeft && !block.bottomRight) {
		return 2;
	}
	if (block.topLeft && block.topRight && !block.bottomLeft && !block.bottomRight) {
		return 3;
	}
	if (block.topLeft && !block.topRight && block.bottomLeft && block.bottomRight) {
		return 4;
	}

    // ... remaining cases ...
}

QPointF imageProcessing::Contouring::linearInterpolation(int x1, int y1, int x2, int y2) {
	QPointF point;

	point.setX((x1 + x2) / 2.0);
	point.setY((y1 + y2) / 2.0);

	return point;
}
```

To get each line, I created another data object that stores a starting point and an ending point in my class:
```c++
struct LineSegment {
			QPointF start;
			QPointF end;

		};
```
By using this handy object, I could proceed to stored the line information to this data type.


```c++
void imageProcessing::Contouring::getLines(const PixelBlock& block) {
	int edgeCase = getEdgeCase(block);
	QPointF intersectionPoint_1;
	QPointF intersectionPoint_2;
	LineSegment line;
	switch (edgeCase) {
		case 0:
		case 15:
			return;
		case 1:
			intersectionPoint_1 = linearInterpolation(block.x1, block.y1, block.x3, block.y3);
			intersectionPoint_2 = linearInterpolation(block.x3, block.y3, block.x4, block.y4);
			line.start = intersectionPoint_1;
			line.end = intersectionPoint_2;
			lineSegments.push_back(line);
		case 2:
			intersectionPoint_1 = linearInterpolation(block.x3, block.y3, block.x4, block.y4);
			intersectionPoint_2 = linearInterpolation(block.x2, block.y2, block.x4, block.y4);
			line.start = intersectionPoint_1;
			line.end = intersectionPoint_2;
			lineSegments.push_back(line);

            // ... remaining cases ...
    }
}
```





## 2023-11-25
### Converting QImage to OpenCV::Mat
In order to use the function calls `cv::threshold()` and `GaussianBlur`, I will need to convert `QImage` to `cv::Mat`, and then from `cv::Mat` back to `QImage` so that the images can be displayed on the `Qt` UI again.
The coding process was a bit confusing as I didn't have much prior knowledge about image types and how `Qt` and `OpenCV` deal with different image types. It also took quite some time for me to understand what parameters I need to construct a `cv::Mat` object from the `QImage` I had.

From `QImage` to `cv::Mat`, we need to first check the `QImage`'s format. Since I the format I assigned to each image, when I was reading through the `tiff` file, is `QImage::Format_ARGB32`. The corresponding image format in `OpenCv` will be `CV_8UC4`:

```c++
mat = cv::Mat(inputImage.height(), inputImage.width(), CV_8UC4,
			const_cast<uchar*>(inputImage.bits()),
			static_cast<size_t>(inputImage.bytesPerLine()));
```

Converting from `cv::Mat` to `QImage` is similar to the previous process:
```c++
QImage image(inputMat.data, inputMat.cols, inputMat.rows, inputMat.step, QImage::Format_ARGB32);

```


## 2023-11-15
### Shallow Copy vs. Deep Copy
This issue came up when I was working on storing a `.tiff` file that contains information for a 3D model and displaying the information on `Qt` interface. 
Despite the goal is to get information about the 3D model, my current goal is to show the x-y plane. Here is my code for displaying a single x-y plane on my `Qt` UI.
```c++
void QtWidgetsApplication::onActionFileTriggered() {
    // ...other Code...
        TIFF* tif = TIFFOpen(fileName.toLocal8Bit().constData(), "r");
        if (tif) {
            uint32 columns, rows; 
            size_t numPixels;
            uint32* raster;

            // The number of columns in the image, i.e., the number of pixels per row.
            TIFFGetField(tif, TIFFTAG_IMAGEWIDTH, &columns);
            // The number of rows of pixels in the image.
            TIFFGetField(tif, TIFFTAG_IMAGELENGTH, &rows);

            numPixels = columns * rows;
            // allocate memory for storing the pixels on the image.
            raster = (uint32*)_TIFFmalloc(numPixels * sizeof(uint32));

            if (raster != nullptr) {
                if (TIFFReadRGBAImage(tif, columns, rows, raster, 0)) {
                    QImage image((uchar*)raster, columns, rows, QImage::Format_ARGB32);
                    ui.label->setPixmap(QPixmap::fromImage(image));
                }
                _TIFFfree(raster);
            }
        }
        TIFFClose(tif);
        //...Other code...
    }
```
The `raster` is allocated with the number of pixels in one image. And then we check if the `raster` is null or not; if it isn't null, we call `TIFFReadRGBAImage()` which reads the an aimge into memory and stores it to `raster`. Then, we call the `QImage` constructor from the `Qt` APIs and create an Qt image. Finally, we handle the image data by using `Qpixmap::fromImage()` and show it on the `label` component in the UI. 

Now, since it is a 3D image, it should have more than one image information. Below was an **unsuccessful** attempt of mine to store all images into a `QVector` object called `images`:
```c++
    do {
        raster = (uint32*)_TIFFmalloc(numPixels * sizeof(uint32));
        if(raster != nullptr) {
            if(TIFFReadRGBAImage(tif, columns, rows, raster ,0)) {
                QImage image((uchar*)raster, columns, rows, QImage::Format_ARGB32);
                images.push_back(image); // push each image to a QVector called images
            }
        }
        _TIFFfree(raster);
    } while (TIFFReadDirectory(tif));
```
I thought by using `TIFFReadDirectory()` to traverse through all image data through the `tif` variable, I can easily store image data for each image to the vector container. However, things are slightly trickier than I expected. When I was trying to make a slider on Qt UI that would allow user to slide through all the images, I kept getting *an error about accessing invalid memory address*. It turned out that the container was able to store the image (i.e., images[0] is valid and images.size() > 1), but the pixels for each image were invalid. This is because **when I created a QImage using the `QImage` constructor, it does not copy the raster data. Instead, it uses the existing memory buffer (which is raster). This is fine for a single image because I immediately use this `QImage` to set a pixmal on the label, but when I store the QImage in a vector for later use, I would be running into a problem because the raster data was being free with `TIFFfree(raster)`. That said, when I later access the QImage in the vector container, the pixel wouldn't be valid thus leading to illegal memory access.** To fix this issue, I would need to perform a deep copy.

Fixed code:
```c++
    do {
        raster = (uint32*)_TIFFmalloc(numPixels * sizeof(uint32));
        if(raster != nullptr) {
            if(TIFFReadRGBAImage(tif, columns, rows, raster ,0)) {
                QImage image((uchar*)raster, columns, rows, QImage::Format_ARGB32);
                QImage temp = image.copy(); // FIX: this performs a deep copy
                images.push_back(temp); // FIX: push the copied image to images.
            }
        }
        _TIFFfree(raster);
    } while (TIFFReadDirectory(tif));
```