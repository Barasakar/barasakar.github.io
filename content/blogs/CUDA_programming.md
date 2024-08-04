---
title: "CCCL OpenSource Contribution "
description: "This blog will record my learning journey contributing to CCCL"
tags: ["Opensource Contribution"]
date: "2024-01-27"
draft: false
hideInitially: false
---
## 08/03/2024:
### Setup Dev Environment for CCCL:
I have been always wanted to work on the CCCL opensource library for a while, but the last time I tried it, I couldn't setup the dev container for some reasons. It always told me I was missing something and the dev container connection did not work. I think part of the `devcontainer.json` didn't work as expected on my machine, especially this part:
```json
  "initializeCommand": [
    "/bin/bash",
    "-c",
    "mkdir -m 0755 -p ${localWorkspaceFolder}/.{aws,cache,config}"
  ],
```
I also had some issues with disk storage, as an image in a container takes a lot of space. I was able to fix this issue by running following commands from this [post](https://stackoverflow.com/questions/62441307/how-can-i-change-the-location-of-docker-images-when-using-docker-desktop-on-wsl2).

```shell
wsl --list -v #see the state of all containers
wsl --shutdown #shut down all the containers
wsl --export [IMAGE_NAME] "D:\path\to\the\folder\name.tar" # export the image (which is [NAME]) to a directory as .tar
wsl --unregister [IMAGE_NAME] # unregister
wsl --import [IMAGE_NAME] "D:\folder\you want the image to be\" "D:\path to the .tar" --version 
```
