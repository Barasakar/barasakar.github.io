---
title: "Dev Blog for Image Processing Project:"
description: "This blog records some of the interesting stuff I noticed during my development for an Image Processing software that is based on C++."
tags: ["Image Processing", "Dev Blog"]
draft: false
---

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