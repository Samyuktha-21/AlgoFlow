/* Hand-authored per-language line maps for the `stacks-queues` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent line;
   `null` = this language genuinely has no equivalent line. */
module.exports = {
  /* java: 2 = the backing array, 4 = the constructor, 7 = the push body,
     9 = pop().
     C++ shipped only a `main` that exercises `std::stack` — there was no
     structure, constructor or push body to point at — so it is rewritten as an
     explicit array-backed stack matching Java. */
  stackImpl: {
    snippets: {
      cpp: `#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

struct Stack {
    vector<int> arr;
    int top = -1;
    Stack(int capacity) : arr(capacity) {}
    void push(int val) {
        if (top == (int)arr.size() - 1) throw runtime_error("Stack overflow");
        arr[++top] = val;
    }
    int pop() {
        if (top == -1) throw runtime_error("Stack underflow");
        return arr[top--];
    }
    int peek() { return arr[top]; }
    bool isEmpty() { return top == -1; }
};

int main() {
    Stack s(10);
    s.push(1);
    s.push(2);
    s.push(3);
    cout << s.pop() << " " << s.peek() << endl;
    return 0;
}`,
    },
    lineMap: {
      // C uses file-scope arrays, so there is no constructor.
      c:          { 2: 2, 4: null, 7: 4, 9: 6 },
      cpp:        { 2: 7, 4: 9, 7: 12, 9: 14 },
      python:     { 2: 3, 4: 2, 7: 6, 9: 8 },
      javascript: { 2: 3, 4: 2, 7: 6, 9: 8 },
    },
  },

  /* java: 2 = the backing array, 4 = the constructor, 7 = advance the rear.
     C++ shipped only a `main` exercising `std::queue` — rewritten as the same
     circular-buffer queue Java implements. */
  queueImpl: {
    snippets: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

struct Queue {
    vector<int> arr;
    int head = 0, rear = 0, size = 0, capacity;
    Queue(int cap) : arr(cap), capacity(cap) {}
    void enqueue(int val) {
        arr[rear] = val;
        rear = (rear + 1) % capacity;
        size++;
    }
    int dequeue() {
        int val = arr[head];
        head = (head + 1) % capacity;
        size--;
        return val;
    }
    int front() { return arr[head]; }
    bool isEmpty() { return size == 0; }
};

int main() {
    Queue q(10);
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    cout << q.dequeue() << " " << q.front() << endl;
    return 0;
}`,
    },
    lineMap: {
      c:          { 2: 2, 4: null, 7: 4 },
      cpp:        { 2: 6, 4: 8, 7: 11 },
      // Python models the queue with two stacks; the in-stack is the storage.
      python:     { 2: 3, 4: 2, 7: 7 },
      javascript: { 2: 3, 4: 2, 7: 6 },
    },
  },

  /* java: 2 = the class, 4 = the auxiliary min stack, 7 = compute the new
     minimum, 8 = push it.
     C, C++ and JS all folded "compute the min" and "push the min" onto one
     line (java 7 and 8 would collide), and C declared both stacks on one line
     (java 2 and 4 would collide) — all three split apart. */
  minStack: {
    snippets: {
      c: `#include <stdio.h>

int main_stack[100];
int min_stack[100];
int top = -1;

void push(int v) {
    main_stack[++top] = v;
    int mn = (top == 0) ? v : (v < min_stack[top - 1] ? v : min_stack[top - 1]);
    min_stack[top] = mn;
}

void pop() {
    top--;
}

int getMin() {
    return min_stack[top];
}

int main() {
    push(-2);
    push(0);
    push(-3);
    printf("%d\\n", getMin());
    pop();
    printf("%d\\n", getMin());
    return 0;
}`,
      cpp: `#include <iostream>
#include <stack>
#include <algorithm>
using namespace std;

struct MinStack {
    stack<int> s;
    stack<int> ms;
    void push(int v) {
        s.push(v);
        int mn = ms.empty() ? v : min(v, ms.top());
        ms.push(mn);
    }
    void pop() {
        s.pop();
        ms.pop();
    }
    int top() { return s.top(); }
    int getMin() { return ms.top(); }
};

int main() {
    MinStack ms;
    ms.push(-2);
    ms.push(0);
    ms.push(-3);
    cout << ms.getMin() << endl;
    ms.pop();
    cout << ms.getMin() << endl;
    return 0;
}`,
      javascript: `class MinStack {
  constructor() {
    this.stack = [];
    this.mins = [];
  }
  push(x) {
    this.stack.push(x);
    const min = this.mins.length === 0 ? x : Math.min(x, this.getMin());
    this.mins.push(min);
  }
  pop() {
    this.mins.pop();
    return this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return this.mins[this.mins.length - 1];
  }
}

const s = new MinStack();
s.push(-2);
s.push(0);
s.push(-3);
console.log(s.getMin());
s.pop();
console.log(s.getMin());`,
    },
    lineMap: {
      c:          { 2: 3, 4: 4, 7: 9, 8: 10 },
      cpp:        { 2: 6, 4: 8, 7: 11, 8: 12 },
      python:     { 2: 1, 4: 4, 7: 8, 8: 9 },
      javascript: { 2: 1, 4: 4, 7: 8, 8: 9 },
    },
  },

  /* java: 2 = the buffer + indices, 5 = the full check, 9 = enqueue succeeded. */
  circularQueue: {
    lineMap: {
      c:          { 2: 2, 5: 4, 9: 8 },
      cpp:        { 2: 4, 5: 8, 9: 12 },
      python:     { 2: 3, 5: 8, 9: 12 },
      javascript: { 2: 4, 5: 9, 9: 12 },
    },
  },

  /* java: 2 = the demo class, 4 = create the queue, 7 = draining by priority,
     8 = the queue is empty.
     The Java block is a usage demo whose referenced lines include comments, so
     each language maps to the same four moments: the queue's storage, the
     insert, the extract-min, and the drain. */
  /* Re-anchored: the steps used to point at java 7 (a `// Output:` comment)
     and java 8 (a blank line), so playback highlighted nothing meaningful.
     java: 4 = create the queue, 5 = the offers, 6 = the drain loop (both the
     poll and the "queue is empty now" step land here — Java does the poll and
     the print on that one line). */
  priorityQueue: {
    lineMap: {
      c:          { 2: 2, 4: 3, 7: 16, 8: 38 },
      cpp:        { 2: 5, 4: 6, 7: 12, 8: 11 },
      python:     { 4: 3, 5: 5, 6: 8 },
      javascript: { 2: 1, 4: 3, 7: 15, 8: 38 },
    },
  },

  /* java: 2 = the class, 5 = the result array, 7 = the index stack,
     9 = resolve everything smaller than the current value, 11 = push the
     current index. */
  nextGreaterElement: {
    lineMap: {
      c:          { 2: 2, 5: 4, 7: 3, 9: 6, 11: 7 },
      cpp:        { 2: 5, 5: 7, 7: 8, 9: 10, 11: 14 },
      python:     { 2: 1, 5: 2, 7: 3, 9: 5, 11: 7 },
      javascript: { 2: 1, 5: 2, 7: 3, 9: 5, 11: 8 },
    },
  },

  /* java: 2 = the class, 4 = the stack, 8 = pop the expected opener,
     11 = the final emptiness check. */
  validParenthesesStack: {
    lineMap: {
      c:          { 2: 2, 4: 3, 8: 10, 11: 14 },
      cpp:        { 2: 4, 4: 5, 8: 12, 11: 16 },
      python:     { 2: 1, 4: 3, 8: 7, 11: 9 },
      javascript: { 2: 1, 4: 2, 8: 6, 11: 11 },
    },
  },
}
