---
title: "LeetCode Problems"
description: "Some notes for the LeetCode grind. The solution is written in C++."
tags: ["LeetCode"]
draft: false
date: "2024-01-19"
hideInitially: true #this is a custom Front Matter Variable.
---
## Clone Graph (Medium):
Oof, this is actually a confusing question. In my original implementation, I was using hashmap(unordered_map) but with type `<int, int>`, but it actually makes the question easier with type `<Node*, Node*>`

Another thing that I was struggling to understand is to clone and maintain a graph structure for the new graph. In c++, we kinda need to use the keyword `new` to clone it. To maintain a graph structure, I need to make sure to update the adjacency list properly. 

```c++
Node* cloneGraph(Node* node) {
        // let's do BFS
        if (node == nullptr) {
            return nullptr;
        }
        Node* result = new Node(node->val);
        queue<Node*> q;

        unordered_map<Node* , Node* > visited; //this
        visited[node] = result;
        q.push(node);
        while (!q.empty()) {
            Node* currentNeighbor = q.front();
            q.pop();
            for (Node* node : currentNeighbor->neighbors) {
                if (visited.find(node) == visited.end()) {
                    q.push(node);
                    visited[node] = new Node(node->val);
                }
                // this is the step that I am actually confused about:
                visited[currentNeighbor]->neighbors.push_back(visited[node]);
            }
        }
        return result;
    }
```


## Binary Tree Level Order Traversal (Medium): 
I think this is a straight forwarded question; it simply asks you to traverse the nodes each level, and then group the nodes into a `vector<vector<int>>` datatype. 
Now, when thinking about traversing all the nodes each level, it isn't hard to associate this concept with BFS.
BFS is a rather generic algorithm, but for this question, there needs to have a little tweak to the BFS:
- First we start pushing nodes in the current level to a `queue`.
- Second, based on **the size of the queue**, we process the nodes currently in the queue. Using the size of the queue as a restraint for processing the queue is a key for solving this problem, as this restraint helps us separate nodes by levels.
- Then we push the left and right nodes of the current processing node to the queue. After this, we pop the node.

```c++
    vector<vector<int>> levelOrder(TreeNode* root) {
        // result vector:
        vector<vector<int>> result;
        if (root == nullptr) {
            return result;
        }
        // queue for handling BFS
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> temp;
            int currentSize = q.size();
            for (int i = currentSize; i > 0; i--) {
                TreeNode* currentNode = q.front();
                q.pop();
                temp.push_back(currentNode->val);
                queueNode(currentNode, q);
            }
            result.push_back(temp);
            temp.clear();
        }
        return result;
    }
    void queueNode(TreeNode* root, queue<TreeNode*> &q) {
        if (root->left != nullptr) {
            q.push(root->left);
        }
        if (root->right != nullptr) {
            q.push(root->right);
        }

    }
```

## 3Sum (Medium)
This problem is essentially a `two-pointer` problem, except it gives another point as a third point. The difficult part about this problem is, in my opinion, figuring out the skipping logic. Everything else is fairly straight forward.

**Here is an outline of the algorithm:**
- If the size of the input vector is less than 3, you return it.
- Sort the input.
- Loop through the input and set each iteration as the pointer 3:
    - When looping, be sure to check if the current pointer 3 is repeating.
        - If so, `continue` the loop.
        - If not, check if the sum of pointer 1, 2, and 3 is 0.
            - If so, push it to the result.
                - also make sure to skip both pointer 1 andd 2's repeated value, if any.
            - Otherwise based on the situation, update pointer 1 and 2 positions accordingly.

```c++
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> result;
        if (nums.size() < 3) {
            return vector<vector<int>>();
        }
        sort(nums.begin(), nums.end());

        for (int x = 0; x < nums.size(); ++x) {
            int i = x + 1;
            int j = nums.size() - 1;
            if (x > 0 && nums[x] == nums[x - 1]) {
                    //x++;
                    continue;
            }
            while (i < j) {
                if (nums[x] + nums[i] + nums[j] == 0) {
                    result.push_back(vector<int>{nums[x], nums[i], nums[j]});
                    i++;
                    j--;
                    while (i < j && nums[i] == nums[i - 1]) {
                        i++;
                    }
                    while (i < j && nums[j] == nums[j + 1]) {
                        j--;
                    }
                } else if (nums[x] + nums[i] + nums[j] < 0) {
                    i++;
                } else {
                    j--;
                }
            }   
        } 
        return result;
    }
```  



## K Closest Points to Origin (Medium)
It is not hard to solve this question, but it is a tricky to solve it optimally. 

My original solution simply involves solving the question by sorting it (with merge sort) and then pick the first k elements from the sorted vector:
```c++
 vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        mergeSort(points, 0, points.size() - 1);
        vector<vector<int>> output;
        for (int i = 0; i < k ; ++i) {
            output.push_back(points[i]);
        }
        return output;
    }
    void mergeSort(vector<vector<int>>& points, int const begin, int const end) {
        if (begin >= end) {
            return;
        }
        int mid = begin + (end - begin) / 2;
        mergeSort(points , begin, mid);
        mergeSort(points, mid + 1, end);
        merge(points, begin, mid, end);
    }
    void merge(vector<vector<int>>& points, int const left, int const mid, int const right) {
        int const arrayOneSize = mid - left + 1;
        int const arrayTwoSize = right - mid;

        vector<vector<int>> leftArray;
        vector<vector<int>> rightArray;

        for (auto i = 0; i < arrayOneSize; i++) {
            leftArray.push_back(points[left + i]);
        }
        for (auto j = 0; j < arrayTwoSize; j++) {
            rightArray.push_back(points[mid + 1 + j]);
        }

        auto indexOfSubArrayOne = 0, indexOfSubArrayTwo = 0;
        int indexOfMergedArray = left;

        while (indexOfSubArrayOne < arrayOneSize
           && indexOfSubArrayTwo < arrayTwoSize) {
            double distanceOne = pow(leftArray[indexOfSubArrayOne][0], 2) + pow(leftArray[indexOfSubArrayOne][1], 2);
            double distanceTwo = pow(rightArray[indexOfSubArrayTwo][0], 2) + pow(rightArray[indexOfSubArrayTwo][1], 2);
            if (distanceOne
                <= distanceTwo) {
                points[indexOfMergedArray]
                    = leftArray[indexOfSubArrayOne];
                indexOfSubArrayOne++;
        }
        else {
            points[indexOfMergedArray]
                = rightArray[indexOfSubArrayTwo];
            indexOfSubArrayTwo++;
        }
        indexOfMergedArray++;
        }

        while (indexOfSubArrayOne < arrayOneSize) {
            points[indexOfMergedArray]
                = leftArray[indexOfSubArrayOne];
            indexOfSubArrayOne++;
            indexOfMergedArray++;
        }
        while (indexOfSubArrayTwo < arrayTwoSize) {
            points[indexOfMergedArray]
                = rightArray[indexOfSubArrayTwo];
            indexOfSubArrayTwo++;
            indexOfMergedArray++;
        }
    }

```
And of course, as its length implies, the algorithm is also not efficient. Why would I sort the whole thing if the question only ask for the first k elements? Perhaps I could partially sort the array?



## 01 Matrix (Medium)
This is a matrix related question; when we see a matrix, we can always relate it to a graph (i.e., represent the matrix with graphs). That said, this question can be regarded as a graph problem. Since it is asking me to calculate the distance of every cell to its closest 0-cell, it is difficult not to think about shortest path :D

**Some remarks about shortest path:**
DFS could work, but it only works after traversing through all paths. BFS is usually used for solving shortest path problems because it doesn't need to traverse through all paths to find the shortest path. 
- DFS (stack)
- BFS (queue)
*It is worth noting that BFS works only when all edges have equal and positive weights.*

**Solution:**
Here are a few things that are crucial to solve this problem:
- start with cells that are 0 instead of 1.
- to reduce unnecessary operations, we don't need to use another data structure to keep tracks of `visited`; instead, we simply initialize all the cells with value 1 to `INT_MAX`.


```c++
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int rows = mat.size();
        int cols = mat[0].size();
        queue<pair<int, int>> queue;
        for (int i = 0; i < rows; ++i) {
            for (int j = 0; j < cols; ++j) {
                if(mat[i][j] == 0) {
                    queue.push({i, j});
                } else {
                    mat[i][j] = INT_MAX;
                }
            }
        }
        vector<pair<int, int>> directions = {{0, 1}, {0, -1}, {-1, 0}, {1, 0}};

        while (!queue.empty()) {
            pair<int, int> currentPair = queue.front();
            queue.pop();
            for (auto dir : directions) {
                int newX = currentPair.first + dir.first;
                int newY = currentPair.second + dir.second;
                // check if it is in bound
                if (newX >= 0 && newX < rows && newY >= 0 && newY < cols && mat[newX][newY] ==   INT_MAX) {
                    mat[newX][newY] = mat[currentPair.first][currentPair.second] + 1;
                    queue.push({newX, newY});
                }
            }
        }
        return mat;
    }
```

## Insert Interval (Medium)
When I was working on this question, I found it slightly confusing because there seemed to be having a lot of cases, but I think the trick here is to simplify these cases and make sure that the simplified cases cover all the edge cases. While this sounded easy, it is in fact quite challenging. 

For this question, there are three cases:
- Case 1: if the current interval (`intervals[i]`) ends before `newInterval` starts. 
- Case 2: if the current interval starts before or exactly at the end of `newInterval`. 
- Case 3: there is no overlapping intervals which are larger than the `newInterval`.

Another trick is to make a new vector of vector to return the answer.

Case 2's condition check confused me
```c++
vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> answer;
        int length = intervals.size();
        int i = 0;
        while (i < length && newInterval[0] > intervals[i][1]) {
            answer.push_back(intervals[i]);
            i++;
        }

        while (i < length && newInterval[1] >= intervals[i][0]) {
            newInterval[0] = min(intervals[i][0], newInterval[0]);
            newInterval[1] = max(intervals[i][1], newInterval[1]);
            i++;
        }
        answer.push_back(newInterval);

        while (i < length) {
            answer.push_back(intervals[i]);
            i++;
        }

        return answer;
    }
```



## Maximum Subarray (Medium)
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

It is important to know what the subproblem is for any DP related problems. In the `Maximum Subarray` problem, we want to ask how can the solution to a subproblem help in solving the next subproblem; more specifically, the subproblem can be defined as "What is the maximum subarray sum ending at this particular element (index i)?"

For the dynamic programming approach for the `Maximum Subarray` problem, the algorithm should always think about if we should continue adding numbers to the current subarray, or if we should start a new subarray. Being able to address these two situations is essential to the final solution:
```c++
int maxSubArray(vector<int>& nums) {
        int max_ending_here = 0;
        int max_so_far = INT_MIN;
        for (int i = 0; i < nums.size(); ++i) {
            max_ending_here = max(nums[i], max_ending_here + nums[i]);
            max_so_far = max(max_ending_here, max_so_far);
        } 
        return max_so_far;
    }

```

## Majority Element
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

## Linked List Cycle
The trick here is to have two pointers (one is slower and another is faster). If there is a cycle in a linked list, then these two pointers will meet each other at some point. 
`Note:` it is worth noting that for C++ , you should not expect that C++ allows you to access nullptr. You always have to check if something is a nullptr or not before accessing it. I know it is common sense for C++ programmers, but I did have this wrong assumption `:(`

## Implementing queue with stacks
The hint here is to use two stacks: `input` and `output`. The input stack is responsible for the `push()` operation, and the output stack is for the `peek()` and `pop()` operations.

## Flooding Fill
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


### Improved version
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