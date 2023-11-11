---
title: "CUDA APIs"
description: "Some CUDA API notes."
tags: ["CUDA"]
draft: true
---

## CUDA's Fast Fourier Transform API

Given how prevelant GPUs are used nowadays, it is no surprise Nvidia designs their own (FFT) Fast Fourier Transform implementation by using CUDA, namely, the cuFFT API.
cuFFT uses a mechanism called a `plan`; a `plan` is used for configuraing the CUDA FFT