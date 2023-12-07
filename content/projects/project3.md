---
title: "Arc Remover"
description: "An image processing tool that removes artifacts from image data (.tiff)."
coverImage: ""
weight: 3
draft: true
---

## Introduction📓:
This is a C++ program that focuses on removing arc-liked artifacts from OCT(Optical Coherence Tomagraphy) images. Users can interact with this processing tool through a GUI. Functionalities in this tool include binarization, contouring (with marching squares), and removing arc-liked artifacts. Users can simply open a tiff file, and the program will load the file and display in on the UI.

## Libraries & technologies Involve💻:
- **Programming languages:** `C++`.
- **External Libraries:** `Qt Framework`, `OpenCV`, `LibTIFF`, and `Eigen`.  
- **Tool:** `Visual Studio`.

## Project Description📋:
**Completed Features:**
- Import tiff files [✔︎]
- A slider that allows users to go through all the images in a tiff file [✔︎]
- Binarization [✔︎]
- Contouring [✔︎]
- remove arc-liked artifacts partially [✔︎]

**Incompleted feature (all of them are nice-to-have features):**
- Render tiff files on the GUI in 3D.
- Render the processed tiff files in 3D.

**Core Algorithm:**
The core algorithm that I will be talking about is generating a parabola based on the arc-liked artificat on the image since it plays a big role in removing artifacts.
Here are the steps for this algorithm:
- Find the local maximas on each column in the image. If the column has two or more local maximas, discard them and go to the next one. This step ensures that the program will spot one local maxima for each column. Of course, pixel points will be lost for this step, but it is for the greater good. This step is in the `findPeaks()` function:

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
- Once I find all the possible local maximas (or points) for each row in the image, I proceed to clean up and process these points. Given the nature of this image data, there is a lot of noise that distracts the `findPeaks()` function from finding the idea points. So I select points that are within a certain range (or y-coordinate). Here is the code:
```c++
for (int i = 0; i < first_index.size(); ++i) {
		if (150 < first_index[i] && first_index[i] < medianValue - 160) {
			final_index.push_back(first_index[i]);
			final_frame.push_back(frame[i]);

			//... remaining code...

		}
	}
```

- With the filtered points, next step is to fit these points and find the coefficients for a polynomial functions. This polynomial functions should match the arc-liked artificats as close as possible. 
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

