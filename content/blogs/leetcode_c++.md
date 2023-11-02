---
title: "LeetCode Problems"
description: "Some notes for the LeetCode grind. The solution is written in C++.s"
tags: ["LeetCode"]
draft: false
---

## Flooding Problem:
### Working Solution:
```c++
class Solution {
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        vector <vector<bool>> visited;
        
        int current_color = image.at(sr).at(sc);
        int rows = image.size();
        int cols = image.at(0).size();

        // Initialize visited vector
        visited.resize(rows, vector<bool>(cols, false));

        // Basecase:
        if (current_color == color || visited.at(sr).at(sc) == true) {
            return image;
        } 
        visited[sr][sc] = true;
        image[sr][sc] = color;

        // TODO: make sure it is not out of bound
        // top
        if (sr - 1 >= 0) {
            if (image[sr - 1][sc] == current_color &&
                visited[sr - 1][sc] == false) {
                floodFill(image, sr - 1, sc, color);
            }
        }
        
        if (sr + 1 < rows) {
            // bottom
            if (image[sr + 1][sc] == current_color && 
                visited[sr + 1][sc] == false) {
                floodFill(image, sr + 1, sc, color);
            }
        }
        
        // left
        if (sc - 1 >= 0) {
            if (image[sr][sc - 1] == current_color && 
                visited[sr][sc - 1] == false) {
                floodFill(image, sr, sc - 1, color);
            }
        }
        
        // right
        if (sc + 1 < cols) {
            if (image[sr][sc + 1] == current_color && 
                visited[sr][sc + 1] == false) {
                floodFill(image, sr, sc + 1, color);
            }
        }
        return image;
    }
};
```


### Improved version:
```c++
class Solution {
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        vector <vector<bool>> visited;
        
        int current_color = image.at(sr).at(sc);
        int rows = image.size();
        int cols = image.at(0).size();

        // Initialize visited vector
        visited.resize(rows, vector<bool>(cols, false));

        // Basecase:
        if (current_color == color || visited.at(sr).at(sc) == true) {
            return image;
        } 
        visited[sr][sc] = true;
        image[sr][sc] = color;

        // TODO: make sure it is not out of bound
        // top
        if (sr - 1 >= 0) {
            if (image[sr - 1][sc] == current_color &&
                visited[sr - 1][sc] == false) {
                floodFill(image, sr - 1, sc, color);
            }
        }
        
        if (sr + 1 < rows) {
            // bottom
            if (image[sr + 1][sc] == current_color && 
                visited[sr + 1][sc] == false) {
                floodFill(image, sr + 1, sc, color);
            }
        }
        
        // left
        if (sc - 1 >= 0) {
            if (image[sr][sc - 1] == current_color && 
                visited[sr][sc - 1] == false) {
                floodFill(image, sr, sc - 1, color);
            }
        }
        
        // right
        if (sc + 1 < cols) {
            if (image[sr][sc + 1] == current_color && 
                visited[sr][sc + 1] == false) {
                floodFill(image, sr, sc + 1, color);
            }
        }
        return image;
    }
};

```

# Notes to myself:
- I initially created a 2D vector but didn't initialize it.
- For vector, remember to use `[][]` when you are certain that the current element you are accessing is not out of bound. The `.at()` notation, while being safer, it is slower. This is because direct access using `[]` does not perform this bounds checking, so it's faster. However, it's riskier because if you access an element out of bounds, it results in undefined behavior.

```c++
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            visited.at(i).at(j) = false;
        }
    }
```

```c++
visited.resize(rows, vector<bool>(cols, false));
```