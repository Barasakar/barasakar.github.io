---
title: "LeetCode Problems"
description: "Some notes for the LeetCode grind. The solution is written in C++.s"
tags: ["LeetCode"]
draft: false
date: "2024-01-02"
hideInitially: true #this is a custom Front Matter Variable.
---
## Maximum Subarray (Medium):
Given an integer array `nums`, find the subarray with the largest sum and output the sum.

The intuitive Brute Force approach will be having two for-loops that behaves as follow:
```c++
int largestSum = INT_MIN;
for (int i = 0 ; i < nums.size(); i++) {
    int currentSum = 0;
    for (int j = i; j < nums.size(); j++) {
        currentSum += nums[j];
        largestSum = std::max(currentSum, largestSum);
    }
}

return largestSum
```

However the Brute Force will take `O(N^2)` time. Interviewers ain't gonna be happy with this speed. 

The ideal way is to work on this with Dynamic Programming. To decide whether a problem can be solved with DP, we can ask if this problem can be solved by dividing it up into smaller problems, and if these smaller problems can be used to solve a larger problem.

It is important to know what the subproblem is for any DP related problems. In the `Maximum Subarray` problem, the subproblem can be defined as "What is the maximum subarray sum ending at this particular element (index i)?"

## Majority Element:
- Create a Hash map in C++ by using `unodered_map`:
```c++
std::unordered_map count;
int threshold = nums.size() / 2;
for (int num : nums) {
    // This line is particularly important.
    // The key is the "value of num", and the value is the number of times num has appeared.
    // It does two things: if num is inside count, it increases the value by one; if not, it automatically inserts the 
    // num to the count.
    ++count[num]; 
    if (count[num] > threshold) {
        return num;
    }
}
```
- The second method is Boyer-Moore Voting Algorithm.
You set up a candidate and a count. 
```c++
int candidate = -1;
int count = 0;

for (int num : nums) {
    if (count == 0) {
        candidate = num;
    }
    count += (candidate == num) ? 1 : -1;
}
return candidate;
```

## Linked List Cycle:
The trick here is to have two pointers (one is slower and another is faster). If there is a cycle in a linked list, then these two pointers will meet each other at some point. 
`Note:` it is worth noting that for C++ , you should not expect that C++ allows you to access nullptr. You always have to check if something is a nullptr or not before accessing it. I know it is common sense for C++ programmers, but I did have this wrong assumption `:(`

## Implementing queue with stacks:
The hint here is to use two stacks: `input` and `output`. The input stack is responsible for the `push()` operation, and the output stack is for the `peek()` and `pop()` operations.

## Flooding Fill:
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
- Always remember to initialize something; I initially created a 2D vector but didn't initialize it.
- For vector, remember to use `[][]` when you are certain that the current element you are accessing is not out of bound. The `.at()` notation, while being safer, it is slower. This is because direct access using `[]` does not perform this bounds checking, so it's faster. However, it's riskier because if you access an element out of bounds, it results in undefined behavior.

```c++
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            visited.at(i).at(j) = false; // => visited[i][i]
        }
    }
```

```c++
visited.resize(rows, vector<bool>(cols, false));
```