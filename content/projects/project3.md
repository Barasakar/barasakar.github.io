---
title: "Arc Remover"
description: "An image processing tool that removes artifacts from image data (.tiff)."
coverImage: "Images/projects_page/project_3.png"
weight: 2
draft: false
---

## Introduction📓
This C++ program is designed to eliminate arc-like artifacts from OCT (Optical Coherence Tomography) images. It features a user-friendly GUI for interaction. The tool offers functionalities such as binarization, contouring (using the marching squares algorithm), and the removal of arc-like artifacts. Users can effortlessly open a TIFF file, and the program will load and display it on the UI. After this, users can perform image processing operations by simply clicking buttons.

## Libraries & Technologies Involved💻
- **Programming languages:** `C++`.
- **External Libraries:** `Qt Framework`, `OpenCV`, `LibTIFF`, and `Eigen`.  
- **Tool:** `Visual Studio`.

## Project Demo
The GUI is developed using Qt's framework. Users can import a TIFF file, and the program will read the file, transform it into QImages, and display the images on the UI.
![Import File](/Images/projects_content/project_3/importFile.gif)

The imported images are grayscale. If desired, the program can binarize the image using the Otsu Threshold Algorithm and Gaussian Blur from OpenCV, while maintaining the grayscale status of the images.
![Binarization](/Images/projects_content/project_3/Binarization.gif)

Another functionality is contouring, which draws contours around the white pixels (with a value of 255) in the images.
![contouring](/Images/projects_content/project_3/contouring.gif)

Finally, the program attempts to eliminate the arc-like artifacts in the images. There are still some imperfections in the removal process, as some arcs may not be completely removed. 
 try to get rid of the arc-liked artifacts on the images:
![goal](/Images/projects_content/project_3/goal.png)

![removeArcs](/Images/projects_content/project_3/Maxima.gif)

![removeArcs](/Images/projects_content/project_3/removeArc.gif)

There are still some flaws with the removing process as you might have noticed some arcs are not being removed. 

## Project Description📋
**Completed Features:**
- Import TIFF files [✔︎]
- A slider to navigate through images in a TIFF file [✔︎]
- Binarization [✔︎]
- Contouring [✔︎]
- Partial removal of arc-like artifacts [✔︎]

**Incomplete Features (nice-to-have):**
- Render TIFF files in 3D on the GUI.
- Render the processed TIFF files in 3D.

**Core Algorithm:**
The core algorithm involves generating a parabola based on the arc-like artifact in the image, which is crucial in artifact removal. The steps include:
- Finding local maxima in each column of the image, discarding columns with multiple maxima. This is performed in the `findPeaks()` function.
- Filtering the points based on a certain range (y-coordinate), as shown in the provided code snippet.
- Fitting the filtered points to a polynomial function that closely matches the arc-like artifacts.
- Generating y-values for the curve using the coefficients and x-values.
- Using this information to either draw or erase the artifact based on the parabola, as demonstrated in the `drawQuadratic()` function.

```c++
void imageProcessing::findPeaks(QImage image, QVector<int> & peaksVal, QVector<int> &peaksLocation, int x) {
	if (!image.isNull()) {
		for (int y = 1; y < image.height() - 1; ++y) {
			int pixelValue = qGray(image.pixel(x, y));
			if (pixelValue > qGray(image.pixel(x, y - 1))
				&& pixelValue > qGray(image.pixel(x, y + 1))) {
				peaksVal.push_back(pixelValue);
				peaksLocation.push_back(y);
			}
		}
	}
}
```

```c++
for (int i = 0; i < first_index.size(); ++i) {
		if (150 < first_index[i] && first_index[i] < medianValue - 160) {
			final_index.push_back(first_index[i]);
			final_frame.push_back(frame[i]);

			//... remaining code...

		}
	}
```

```c++
void imageProcessing::polyfit(const QVector<int>& x, const QVector<int>& y, Eigen::VectorXd& coefficients, int order) {
	int numPoints = x.size();
	MatrixXd X(numPoints, order + 1);
	VectorXd yVec(numPoints);

	for (int i = 0; i < numPoints; ++i) {
		int value = 1;
		for (int j = 0; j <= order; ++j) {
			X(i, j) = value;
			value *= x[i];
		}
		yVec(i) = y[i];
	}

	coefficients = (X.transpose() * X).ldlt().solve(X.transpose() * yVec);
}
```

What this function does are: 1) creating a matrix `X` that stores powers of x-values. Each row corresponds to a data point, and each column corresponds to a power of x. 2) create a matrix `yVec` that stores the y-values of the filtered points. 3) calculate the coefficients by using the method of least squares.

- The next step is generating the y-values for the curve. Given that we have the x-values and coefficients, we can find the y-values for the curve. 
```c++
void imageProcessing::polyVal(const Eigen::VectorXd& coefficients, const Eigen::VectorXd& x, Eigen::VectorXd& y) {
	int numPoints = x.size();
	y.resize(numPoints);

	for (int i = 0; i < numPoints; ++i) {
		int value = 1;
		y[i] = 0;
		for (int j = 0; j < coefficients.size(); ++j) {
			y[i] += coefficients[j] * value;
			value *= x[i];
		}
	}
}
```
This function goes through all the filtered points and calculates the term `coefficients[j] * value` and adds it to `y[i]`; this process corresponds to building up the polynomial term by term for the specific x-value.

- Now that we have all the information we need, we can either draw the parabola out or erase the artifact based on the parabola. The following code shows the drawing process by using the information we have:
```c++
void imageProcessing::drawQuadratic(QImage& image) {
	formPolynomialSingleDraw(image);
	QPixmap pixmap = QPixmap::fromImage(image);
	QPainter painter(&pixmap);
	QPen pen(Qt::red, 2);
	painter.setPen(pen);

	double a = coefficients(2);
	double b = coefficients(1);
	double c = coefficients(0);

	QPoint prevPoint;
	bool firstPoint = true;

	for (int x = 0; x < image.width(); x++) {
		double y = a * x * x + b * x + c;
		QPoint currentPoint(x, y);
		if (!firstPoint) {
			painter.drawLine(prevPoint, currentPoint);
		}
		prevPoint = currentPoint;
		firstPoint = false;
	}
	painter.end();
	image = pixmap.toImage();
}

```

