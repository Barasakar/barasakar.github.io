---
title: "Game Engine Dev Blog"
description: "This blog will record my learning journey of programming a basic Game Engine"
tags: ["Engine Programming"]
date: "2024-01-27"
draft: false
hideInitially: true
---
## Setup:
### Software and libraries used:
- OpenGL (GLFW library in particular)
- GLAD (for managing function pointers for OpengGL)
- C/C++
- Textbook: Learn OpenGL - Graphics Programming by Joey de Vries

## Understanding OpenGL rendering pipeline:
OpenGL treats everything in 3D. Since our computers and screens are 2D, OpenGL has to convert the 3D coordinates to 2D coordinates. After this, it will transform the 2D coordinates to actual colored pixels.

**Shaders** is an important aspect of OpenGL. Shaders are small programs that process the input data given to OpenGL. Shaders are configurable; developers can modify shaders to process input data tailored to their vision. 
