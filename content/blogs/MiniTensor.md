---
title: "MiniTensor Dev Journal"
description: "This is a dev journal about creating a mini tensorflow library written by C++ and CUDA."
tags: ["CUDA","Tensorflow" , "Dev Blog"]
draft: false
date: "2024-07-11"
hideInitially: false #this is a custom Front Matter Variable.
---
# 2024-07-11
## Refined Error Handling:
Originally for the error handling, I created this macro `cudaCheckError`:
```C++
#define cudaCheckError(call) \
    do { \
        cudaError_t error = call; \
        if (error != cudaSuccess) { \
            std::cerr << "CUDA Error: " << cudaGetErrorString(error) << " in file " << __FILE__ << " at line " << __LINE__ << std::endl; \
            exit(error); \
        } \
    } while(0)

```
This macro simply spills out the error in which file and at what line of the project, and terminate the program immediately. Not so graceful. That said, I decided to use **Exceptions** to improve error handling:
```C++
#define cudaCheckError(call) \
    do { \
        cudaError_t error = call; \
        if (error != cudaSuccess) { \
            std::string msg = "CUDA Error: " + std::string(cudaGetErrorString(error)) + " in file " + __FILE__ + " at line " + std::to_string(__LINE__); \
            throw std::runtime_error(msg); \
        } \
    } while(0)
```


# 2024-07-09
## Initial thoughts for project structure:
Given this project is going to be a mimic of Tensorflow library, I wanted to try my best to think about encapsulation and resource management. I could currently think of two ways of making my MiniTensorflow more dynamic and robust: 
- Usage of template programming in C++ for flexibility with different data types, which is essential for a library intended for machine learning operations. 
- Create a dedicate resource management class that focuses on Resource Acquisition is Initialization (RAII) by managing device memory allocation/de-allocation.

## Progress thus far:
### Memory Management Class:
```C++
// CudaMemoryManagement_T.h
#pragma once
#ifndef CUDA_MEMORY_MANAGEMENT_T_H
#define CUDA_MEMORY_MANAGEMENT_T_H
#include "utils.h"

namespace MiniTensor {
	template <typename T>
	class CudaMemoryManagement {
	public:
		CudaMemoryManagement(size_t size) : size_(size), ptr_(nullptr) {
			cudaCheckError(cudaMalloc(&ptr_, size_ * sizeof(T)));
		}
		~CudaMemoryManagement() {
			if (ptr_) {
				cudaCheckError(cudaFree(ptr_));
			}
		}
		T* getPtr() const {
			return ptr_;
		}
		//Disable both copy constructor and assignment operator to avoid double free errors as copy and assignment
		// operators might lead to multiple objects managing the same resource.
		CudaMemoryManagement(const CudaMemoryManagement&) = delete;
		CudaMemoryManagement& operator=(const CudaMemoryManagement&) = delete;
		//Move constructor and assignment operator
		CudaMemoryManagement(CudaMemoryManagement&& other) noexcept : size_(other.size_), ptr_(other.ptr_) {
			other.ptr_ = nullptr;
			other.size_ = 0;
		}
		CudaMemoryManagement& operator=(CudaMemoryManagement&& other) noexcept {
			if (this != &other) {
				if (ptr_) { //used ptr_ instead of other.ptr_ because we want to check if this.ptr_ has any ownership or not.
					cudaCheckError(cudaFree(ptr_));
				}
				// Update and nullify:
				ptr_ = other.ptr_;
				size_ = other.size_;
				other.ptr_ = nullptr;
				other.size_ = 0;
			}
			return *this;
		}
	private:
		size_t size_;
		T* ptr_;
	};
}
#endif
```
The idea of having this **CudaMemoryManagement** class is this class will be responsible for allocating and de-allocating CUDA device memory. It will also have a pointer member variable that points to an allocated device memory, ensuring it is properly freed when an object is destroyed. 

As mentioned before, I wish to utilize RAII with this resource management class. In this case, I ensured that **CudaMemoryManagement** class performs device memory allocation inside the constructor and freed in the destructor:

```C++
CudaMemoryManagement(size_t size) : size_(size), ptr_(nullptr) {
			cudaCheckError(cudaMalloc(&ptr_, size_ * sizeof(T)));
		}
~CudaMemoryManagement() {
    if (ptr_) {
        cudaCheckError(cudaFree(ptr_));
    }
}
```
At the same time, this class allows ownership transfer to perform safe resource transferring between objects. For instance, the copy constructor and copy assignment operator are `deleted`. This avoids double-free errors when users abusively used copy constructor. Here is an example as to why a copy constructor and copy assignment operator could be dangerous:

```C++
CudaMemoryManagement<int> A(100);
CudaMemoryManagement<int> B = A;
```
In the code, both A and B point to the same memory location. So when these two objects are destroyed (it doesn't matter which one gets destroyed first), one of the objects will be freeing a memory location that has already been freed. This is problematic.

Instead, we could use **move semantics** to transfer ownership. This semantics allows you to transfer one **CudaMemoryManagement** to another without copying the resource itself. Also the `noexcept` keyword here just to specify these two functions don't throw exceptions; the goal for that is to ensure objects are in a valid state even if an exception occurs somewhere else. 

### Integrate CudaMemoryManagement into other classes:
Here is the usage as to how it could work in other classes. I have this **MatrixOperations** class that performs different matrix operations. Originally for **MatrixOperations** constructor, I have something like this:
```C++
template <typename T>
MatrixOperations<T>::MatrixOperations(long long rows, long long cols)
    : rows_(rows), cols_(cols), total_size_(rows * cols) {
    cudaCheckError(cudaMalloc(&d_input_1_, total_size_ * sizeof(T)));
    cudaCheckError(cudaMalloc(&d_input_2_, total_size_ * sizeof(T)));
    cudaCheckError(cudaMalloc(&d_output_, total_size_ * sizeof(T)));
}
```
This is cumbersome. If this project becomes scalable, it is hard to manage the resources and spot bugs. With the memory resource class, the constructor can be encapsulated as simple as follow:

```C++
CudaMemoryManagement<T> d_input_1_;
CudaMemoryManagement<T> d_input_2_;
CudaMemoryManagement<T> d_output_;
template <typename T>
MatrixOperations<T>::MatrixOperations(long long rows, long long cols)
    : rows_(rows), cols_(cols), total_size_(rows * cols),
      d_input_1_(total_size_), d_input_2_(total_size_), d_output_(total_size_) {
}
```
