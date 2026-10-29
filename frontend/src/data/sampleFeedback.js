// Sample code snippets demonstrating common beginner programming pitfalls
export const STARTER_CODE = {
  python: `def calculate_average(numbers):
    total = 0
    # Beginner pitfall: Using range(len()) instead of direct iteration
    for i in range(len(numbers)):
        total += numbers[i]
    
    # Bug: Will raise ZeroDivisionError if the list is empty!
    return total / len(numbers)

# Test with an empty list
scores = []
print("Average score:", calculate_average(scores))`,

  javascript: `function findStudent(students, targetId) {
  // Beginner pitfall: Off-by-one error (<= instead of <)
  for (var i = 0; i <= students.length; i++) {
    // Beginner pitfall: Loose equality (==) and accessing undefined at end of array
    if (students[i].id == targetId) {
      return students[i];
    }
  }
  return "Not found";
}

const roster = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
console.log(findStudent(roster, 2));`,

  java: `import java.util.Scanner;

public class StringReverser {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a word: ");
        String input = scanner.nextLine();
        
        String reversed = "";
        // Beginner pitfall: StringIndexOutOfBoundsException (input.length() is out of bounds)
        // Also String concatenation in a loop is O(n^2) inefficient in Java
        for (int i = input.length(); i >= 0; i--) {
            reversed += input.charAt(i);
        }
        
        System.out.println("Reversed word: " + reversed);
        // Note: scanner is never closed (Resource leak)
    }
}`,

  cpp: `#include <iostream>
using namespace std;

// Beginner pitfall: Returning a pointer to a stack-allocated local array
int* createSequence(int size) {
    int localArr[size]; // Variable Length Array (non-standard in C++)
    for (int i = 0; i < size; i++) {
        localArr[i] = (i + 1) * 10;
    }
    // Bug: Dangling pointer! localArr is destroyed when function returns
    return localArr;
}

int main() {
    int* numbers = createSequence(5);
    cout << "First item: " << numbers[0] << endl;
    return 0;
}`
};

// Hand-crafted pedagogical reviews for the sample code
export const SAMPLE_REVIEWS = {
  python: {
    summary: "Your function logic is easy to follow, but it contains a critical runtime crash on empty inputs and non-Pythonic loop syntax.",
    issues: [
      {
        id: "py-1",
        type: "Critical",
        line: 9,
        title: "ZeroDivisionError on Empty List",
        description: "When 'numbers' is empty, len(numbers) is 0. Dividing by zero immediately crashes your Python script at runtime."
      },
      {
        id: "py-2",
        type: "Style",
        line: 4,
        title: "Non-Pythonic Loop (range(len()))",
        description: "Iterating by indexing (range(len(numbers))) is typical in C/Java, but in Python you can loop directly over elements or use sum()."
      },
      {
        id: "py-3",
        type: "Best Practice",
        line: 1,
        title: "Missing Function Docstring and Type Hints",
        description: "Adding docstrings and parameter type hints helps readers and IDEs understand what input types are expected."
      }
    ],
    explanation: "In Python, mathematical division by zero is not permitted and results in an immediate ZeroDivisionError exception. To make your code robust for real-world usage, always anticipate edge cases like empty datasets before performing arithmetic. Furthermore, Python treats code readability as a core philosophy—using built-in functions like sum() makes code both faster and more readable.",
    hints: [
      "Ask yourself: What should the average of an empty collection be? Usually 0.0 or None makes sense.",
      "Try adding a guard clause at the very top: 'if not numbers: return 0.0'.",
      "Look up Python's built-in sum() function. You can calculate the entire sum in one simple expression without a loop!"
    ],
    improvedCode: `def calculate_average(numbers: list[float]) -> float:
    """Calculates the arithmetic mean of a list of numbers.
    Safely returns 0.0 if the input list is empty.
    """
    if not numbers:
        return 0.0
    
    return sum(numbers) / len(numbers)

# Safe testing:
print("Empty list average:", calculate_average([]))        # Outputs: 0.0
print("Normal list average:", calculate_average([10, 20, 30])) # Outputs: 20.0`,
    takeaways: [
      "Always validate collection lengths before dividing.",
      "Prefer Python built-ins (sum, max, min) over manual index loops.",
      "Use type hints (numbers: list[float]) to catch bugs early."
    ]
  },

  javascript: {
    summary: "Good structure, but there is a common off-by-one index boundary bug and loose equality usage.",
    issues: [
      {
        id: "js-1",
        type: "Critical",
        line: 2,
        title: "Off-by-One Loop Condition (<=)",
        description: "Arrays in JavaScript are zero-indexed up to length - 1. When i equals students.length, students[i] is undefined, causing a TypeError when reading .id."
      },
      {
        id: "js-2",
        type: "Warning",
        line: 4,
        title: "Loose Equality (==) Instead of Strict (===)",
        description: "The '==' operator performs implicit type coercion (e.g. '2' == 2 is true). Use '===' to avoid subtle type bugs."
      },
      {
        id: "js-3",
        type: "Style",
        line: 2,
        title: "Legacy 'var' Declaration",
        description: "var is function-scoped and can leak outside the loop. Modern JavaScript uses block-scoped 'let' or 'const'."
      }
    ],
    explanation: "Because arrays begin at index 0, an array with 2 items only has indices 0 and 1. Loop condition 'i <= students.length' forces an extra iteration at index 2. At that point, students[2] evaluates to undefined, and attempting to read undefined.id throws an uncaught error. Also, JavaScript modern best practices strongly discourage 'var' in favor of 'let' and 'const'.",
    hints: [
      "Check your loop boundary: Should it be i < students.length or i <= students.length?",
      "In modern JavaScript, the Array.prototype.find() method can replace the entire for-loop in a single readable line.",
      "Switch to triple equals (===) to ensure both value and type match strictly."
    ],
    improvedCode: `function findStudent(students, targetId) {
  // Array.prototype.find cleanly handles iteration and boundaries
  const student = students.find((s) => s.id === targetId);
  return student || null;
}

const roster = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
console.log(findStudent(roster, 2)); // { id: 2, name: 'Bob' }
console.log(findStudent(roster, 99)); // null`,
    takeaways: [
      "Remember that the last index of any array is always array.length - 1.",
      "Always use strict equality (===) to avoid unintentional type coercion.",
      "Leverage modern array helper methods like find, filter, and map."
    ]
  },

  java: {
    summary: "Clear algorithmic intent, but contains an out-of-bounds string index error and quadratic string allocation.",
    issues: [
      {
        id: "java-1",
        type: "Critical",
        line: 10,
        title: "StringIndexOutOfBoundsException",
        description: "String indices in Java range from 0 to length() - 1. Calling input.charAt(input.length()) immediately throws an exception."
      },
      {
        id: "java-2",
        type: "Performance",
        line: 11,
        title: "Inefficient String Concatenation in Loop",
        description: "Strings are immutable in Java. Using '+=' inside a loop allocates a new String object each iteration, leading to O(n^2) memory churn."
      },
      {
        id: "java-3",
        type: "Warning",
        line: 5,
        title: "Unclosed Scanner Resource Leak",
        description: "The Scanner connected to System.in is never closed, which can lead to OS resource leaks. Use try-with-resources."
      }
    ],
    explanation: "In Java, characters in a String of length N are indexed from 0 to N-1. When your loop initializes i = input.length(), it asks for index N, which does not exist! Secondly, because String instances cannot be modified in place, repeated string concatenation allocates new objects in the JVM heap. For reversing or building strings, StringBuilder is the standard, high-performance tool.",
    hints: [
      "Look closely at the loop initializer: change 'int i = input.length()' to 'int i = input.length() - 1'.",
      "What happens if the user enters an empty string? Test that scenario.",
      "Java's StringBuilder has a built-in .reverse() method that does this in linear O(n) time!"
    ],
    improvedCode: `import java.util.Scanner;

public class StringReverser {
    public static void main(String[] args) {
        // Try-with-resources automatically closes the scanner
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.print("Enter a word: ");
            String input = scanner.nextLine();
            
            if (input == null || input.isEmpty()) {
                System.out.println("Reversed word: (empty)");
                return;
            }
            
            // StringBuilder is O(n) and avoids allocating new strings in memory
            String reversed = new StringBuilder(input).reverse().toString();
            System.out.println("Reversed word: " + reversed);
        }
    }
}`,
    takeaways: [
      "Always verify 0-based indexing limits when traversing Strings in Java.",
      "Use StringBuilder whenever modifying strings repeatedly.",
      "Protect I/O streams with try-with-resources."
    ]
  },

  cpp: {
    summary: "High-risk memory management issue: returning a pointer to destroyed stack memory.",
    issues: [
      {
        id: "cpp-1",
        type: "Critical",
        line: 9,
        title: "Dangling Pointer (Returning Address of Stack Variable)",
        description: "localArr is allocated on the stack frame of createSequence(). When the function finishes, its stack frame is freed. Dereferencing numbers[0] is undefined behavior."
      },
      {
        id: "cpp-2",
        type: "Warning",
        line: 5,
        title: "Variable Length Array (VLA) is Non-Standard C++",
        description: "int localArr[size] is a C99 extension not officially supported in ISO C++. It can cause stack overflow for large sizes."
      },
      {
        id: "cpp-3",
        type: "Style",
        line: 2,
        title: "Using 'using namespace std;' in Global Scope",
        description: "Dumping the entire std namespace into global scope can cause unexpected naming collisions as projects grow."
      }
    ],
    explanation: "In C++, variables declared locally inside a function live in the 'stack'. As soon as that function returns, that memory is recycled for other function calls. Returning a raw pointer to stack memory means you hold a 'dangling pointer'. When you try reading it in main(), it might output garbage or crash with a segmentation fault. Modern C++ standard containers like std::vector manage memory safely and automatically.",
    hints: [
      "Ask yourself: Where does localArr live? On the stack or on the heap?",
      "If you want dynamic sizing in modern C++, which STL container should you use instead of raw arrays?",
      "Take a look at std::vector<int>—it handles allocation, sizing, and deallocation automatically."
    ],
    improvedCode: `#include <iostream>
#include <vector>

// Modern C++ idiomatic approach: return by value using std::vector
std::vector<int> createSequence(int size) {
    std::vector<int> sequence;
    sequence.reserve(size); // Pre-allocate memory for performance
    
    for (int i = 0; i < size; ++i) {
        sequence.push_back((i + 1) * 10);
    }
    return sequence; // Fast and safe (move semantics, no memory leaks)
}

int main() {
    std::vector<int> numbers = createSequence(5);
    if (!numbers.empty()) {
        std::cout << "First item: " << numbers[0] << "\\n";
    }
    return 0;
}`,
    takeaways: [
      "Never return pointers or references to local stack-allocated variables.",
      "Embrace modern C++ RAII and STL containers like std::vector.",
      "Avoid 'using namespace std;' to keep symbol namespaces clean."
    ]
  }
};

// Heuristic fallback reviewer for custom code entered by the user
export function generateHeuristicReview(code, language) {
  const lines = code.split('\\n');
  const issues = [];
  const hints = [];
  const takeaways = [];

  // General beginner checks
  if (code.includes('==') && !code.includes('===') && (language === 'javascript')) {
    issues.push({
      id: 'h-1',
      type: 'Warning',
      line: findLineNumber(lines, '=='),
      title: 'Loose Equality Operator (==)',
      description: 'Found loose equality comparison. Use strict equality (===) to prevent unexpected type coercion.'
    });
    hints.push("Replace '==' with '===' to verify both type and value.");
  }

  if (code.includes('var ') && language === 'javascript') {
    issues.push({
      id: 'h-2',
      type: 'Style',
      line: findLineNumber(lines, 'var '),
      title: "Use of 'var'",
      description: "'var' has function scope and can introduce hoisting bugs. Modern JavaScript prefers 'let' and 'const'."
    });
    hints.push("Replace 'var' declarations with 'let' (for mutable variables) or 'const' (for immutable references).");
  }

  if (language === 'python' && code.includes('range(len(')) {
    issues.push({
      id: 'h-3',
      type: 'Style',
      line: findLineNumber(lines, 'range(len('),
      title: 'Indexing Anti-Pattern (range(len(...)))',
      description: 'Python is designed for direct iteration. If you need both index and element, use enumerate().'
    });
    hints.push("Use 'for item in collection:' or 'for i, item in enumerate(collection):'.");
  }

  if (language === 'python' && code.includes('/ len(') && !code.includes('if len(') && !code.includes('if not')) {
    issues.push({
      id: 'h-4',
      type: 'Critical',
      line: findLineNumber(lines, '/ len('),
      title: 'Unchecked Division by Length',
      description: 'Dividing by the length of a collection without checking if it is non-empty can cause ZeroDivisionError.'
    });
    hints.push("Add a guard check: 'if not my_list: return 0' before performing division.");
  }

  if (language === 'java' && code.includes('Scanner') && !code.includes('.close()') && !code.includes('try (')) {
    issues.push({
      id: 'h-5',
      type: 'Warning',
      line: findLineNumber(lines, 'Scanner'),
      title: 'Potential Resource Leak',
      description: 'Scanner resource is opened but never closed. Use try-with-resources statement.'
    });
    hints.push("Wrap Scanner initialization in a try-with-resources block: 'try (Scanner sc = new Scanner(...)) { ... }'.");
  }

  if (language === 'cpp' && code.includes('using namespace std;')) {
    issues.push({
      id: 'h-6',
      type: 'Style',
      line: findLineNumber(lines, 'using namespace std;'),
      title: 'Namespace Pollution',
      description: "'using namespace std;' imports the entire standard namespace and may lead to naming conflicts."
    });
    hints.push("Prefer explicitly prefixing standard library items like 'std::cout' and 'std::vector'.");
  }

  // If no specific anti-patterns detected, provide a solid pedagogical structure
  if (issues.length === 0) {
    issues.push({
      id: 'h-clean',
      type: 'Good Practice',
      line: 1,
      title: 'Solid Syntax Foundation',
      description: 'No obvious beginner anti-patterns detected in this snippet. Code compiles and structures logically.'
    });
    hints.push("Consider testing with boundary edge cases: null values, empty collections, and extreme numbers.");
    hints.push("Add explanatory comments or docstrings explaining the algorithmic complexity (Big-O).");
  }

  takeaways.push("Edge-case testing is what separates amateur code from production-ready code.");
  takeaways.push("Clean variable naming and small, single-purpose functions make debugging 10x easier.");

  return {
    summary: `Analyzed ${lines.length} lines of ${language.toUpperCase()} code. Found ${issues.length} review items for pedagogical feedback.`,
    issues,
    explanation: `This review inspected your ${language.toUpperCase()} code for fundamental programming concepts: boundary safety, proper scope, language idioms, and memory efficiency. Beginner programs frequently stumble upon boundary conditions and unhandled edge cases—mastering these will give you a major advantage in your CSE coursework.`,
    hints: hints.length ? hints : ["Write a small unit test verifying how your function behaves with an empty input."],
    improvedCode: `// Refactored and formatted version of your ${language} snippet:\n` + code,
    takeaways
  };
}

function findLineNumber(lines, substr) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(substr)) {
      return i + 1;
    }
  }
  return 1;
}
