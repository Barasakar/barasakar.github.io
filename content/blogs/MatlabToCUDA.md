---
title: " Matlab to CUDA conversion"
description: "This blog post is about some of my thought process and steps I took to convert an image processing program (written in Matlab) to CUDA."
tags: ["Image Processing", "Dev Blog"]
draft: false
date: "2024-03-07"
hideInitially: false #this is a custom Front Matter Variable.
---

## 2024-03-07
### Discrete Fourier Transform Upsamplings:
I am currently working on a Matlab code from my research listed below:

```Matlab
% Compute kernels and obtain DFT by matrix products
kernc=exp((-i*2*pi/(nc*usfac))*( ifftshift([0:nc-1]).' - floor(nc/2) )*( [0:noc-1] - coff ));
kernr=exp((-i*2*pi/(nr*usfac))*( [0:nor-1].' - roff )*( ifftshift([0:nr-1]) - floor(nr/2)  ));
out=kernr*in*kernc;
```

What this code does is creating two kernels for the column and row transformations in Discrete Fourier Transform upsampling process on an image. But man, the conversion from Matlab to CUDA is hard. The Matlab code is written in 2D matrices, but to program these in CUDA, I would need to transform everything into 1D matrices; and also given the nature of CUDA's thread indexing.... Ah, this is quite challenging.

Generating `kernc` and `kernr` aren't too bad with some help from my fellow researcher Andrew; essentially we were able to simplify the `ifftshift` with some formula conversion to get a rather straightforward and clever implementation:
```c++
__global__ void dftups_kernc(cufftComplex* output, cufftComplex* input, int n_data_columns, int n_sample_columns, int upsampling_factor, float col_shift) {
    int idsc = blockDim.x * blockIdx.x + threadIdx.x;
    int iddc = blockDim.y * blockIdx.y + threadIdx.y;

    // matrix (data colunms x sample columns)

    float data_x_pos = (float)(iddc < (n_data_columns / 2) ? iddc : iddc - n_data_columns);
    float data_sample_x_pos = (float)idsc - col_shift;
    float f = -2.0 * PI / (float)(n_data_columns * upsampling_factor) * data_x_pos * data_sample_x_pos;
    // exp(f)
    cufftComplex val = { cos(f), sin(f) };

    output[iddc * n_sample_columns + idsc] = val;
}

__global__ void dftups_kernr(cufftComplex* output, cufftComplex* input, int n_data_rows, int n_sample_rows, int upsampling_factor, float row_shift) {
    // matrix (sample rows x data columns)
    int iddr = blockDim.x * blockIdx.x + threadIdx.x;
    int idsr = blockDim.y * blockIdx.y + threadIdx.y;

    float data_y_pos = (float)(iddr < (n_data_rows / 2) ? iddr : iddr - n_data_rows);
    float data_sample_y_pos = (float)idsr - row_shift;
    float f = -2.0 * PI / (float)(n_data_rows * upsampling_factor) * data_y_pos * data_sample_y_pos;
    // exp(f)
    cufftComplex val = { cos(f), sin(f) };

    output[idsr * n_data_rows + iddr] = val;
}
```

