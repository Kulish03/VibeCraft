/**
 * Curated mock pedagogical reviews for canonical beginner code pitfalls
 */
const CANONICAL_REVIEWS = {
  python: {
    summary: 'Clear algorithmic intent, but contains a runtime zero-division crash risk and non-idiomatic loop iteration.',
    issues: [
      {
        id: 'py-1',
        type: 'Critical',
        line: 9,
        title: 'ZeroDivisionError on Empty Collection',
        description: 'When "numbers" is empty, len(numbers) is 0. Dividing by zero immediately raises a ZeroDivisionError in Python at runtime.'
      },
      {
        id: 'py-2',
        type: 'Style',
        line: 4,
        title: 'Non-Pythonic Loop (range(len()))',
        description: 'Iterating by indexing with range(len(numbers)) is verbose and unidiomatic in Python. Prefer direct iteration or built-in functions.'
      },
      {
        id: 'py-3',
        type: 'Best Practice',
        line: 1,
        title: 'Missing Type Annotations and Docstring',
        description: 'Adding type hints (e.g. numbers: list[float]) and docstrings clarifies expected parameters and return types.'
      }
    ],
    explanation: 'In Python, mathematical division by zero is never permitted and results in an immediate ZeroDivisionError exception. To build reliable software, always anticipate edge cases like empty collections. Additionally, Python emphasizes clean readability: built-in functions like sum() eliminate manual indexing loops entirely.',
    hints: [
      'What should the average of an empty list be? Usually 0.0 or None is safe.',
      'Consider adding a guard clause at the very beginning: "if not numbers: return 0.0".',
      'Look into Python\'s built-in sum() function. You can replace the entire loop with one readable expression!'
    ],
    improvedCode: `def calculate_average(numbers: list[float]) -> float:
    """Calculates arithmetic mean safely. Returns 0.0 for empty input."""
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

# Example usage:
print("Average:", calculate_average([10.0, 20.0, 30.0]))`,
    takeaways: [
      'Always validate collection length before division.',
      'Prefer Python built-in helpers (sum, min, max) over manual index loops.',
      'Add guard clauses at function entry to handle edge cases cleanly.'
    ]
  },

  javascript: {
    summary: 'Good procedural structure, but contains an off-by-one array index bug and uses loose equality comparison.',
    issues: [
      {
        id: 'js-1',
        type: 'Critical',
        line: 2,
        title: 'Off-by-One Loop Condition (<=)',
        description: 'JavaScript arrays are zero-indexed up to length - 1. When i reaches array.length, accessing array[i] yields undefined.'
      },
      {
        id: 'js-2',
        type: 'Warning',
        line: 4,
        title: 'Loose Equality Operator (==)',
        description: 'Loose equality allows unexpected type coercion (e.g. "2" == 2 is true). Always use strict equality (===).'
      },
      {
        id: 'js-3',
        type: 'Style',
        line: 2,
        title: 'Legacy "var" Declaration',
        description: '"var" has function scope and can leak variables unexpectedly. Modern JavaScript uses block-scoped "let" or "const".'
      }
    ],
    explanation: 'Because array indices start at 0, the last element is always at (length - 1). Using "i <= array.length" executes an extra iteration at an undefined index. In modern JavaScript, built-in methods like Array.prototype.find() are less error-prone and much easier to read.',
    hints: [
      'Check the boundary of your loop: should it be "i < array.length" or "i <= array.length"?',
      'Replace the "==" operator with "===" to prevent implicit type coercion.',
      'Explore Array.prototype.find() to retrieve matching elements in a single declarative line.'
    ],
    improvedCode: `function findStudent(students, targetId) {
  // Array.prototype.find cleanly handles boundary safety
  return students.find((s) => s.id === targetId) || null;
}

const roster = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
console.log(findStudent(roster, 2));`,
    takeaways: [
      'The highest valid index in a zero-indexed array is array.length - 1.',
      'Always use strict equality (===) to avoid subtle coercion bugs.',
      'Use modern declarative array methods (find, filter, map) over manual loops.'
    ]
  },

  java: {
    summary: 'Logical flow is clear, but contains an out-of-bounds string index error and memory-inefficient string concatenation.',
    issues: [
      {
        id: 'java-1',
        type: 'Critical',
        line: 10,
        title: 'StringIndexOutOfBoundsException',
        description: 'String indices in Java range from 0 to length() - 1. Accessing charAt(length()) throws an uncaught runtime exception.'
      },
      {
        id: 'java-2',
        type: 'Performance',
        line: 11,
        title: 'Inefficient String Concatenation in Loop',
        description: 'Strings in Java are immutable. Using "+=" in a loop creates a new String object each iteration, leading to O(n^2) allocations.'
      },
      {
        id: 'java-3',
        type: 'Warning',
        line: 5,
        title: 'Unclosed Scanner Resource Leak',
        description: 'The Scanner is not closed after use, causing an OS resource leak. Use try-with-resources.'
      }
    ],
    explanation: 'In Java, a String of length N has character indices from 0 to N-1. Initializing "i = input.length()" accesses index N, which does not exist! Secondly, because String instances cannot be modified in place, repeated concatenation wastes JVM memory. StringBuilder is the recommended tool for modifying strings.',
    hints: [
      'Check your loop starting condition: change "int i = input.length()" to "int i = input.length() - 1".',
      'Look up Java\'s StringBuilder class and its built-in .reverse() method.',
      'Wrap Scanner in a try-with-resources block to guarantee it gets closed automatically.'
    ],
    improvedCode: `import java.util.Scanner;

public class StringReverser {
    public static void main(String[] args) {
        // Try-with-resources closes the scanner automatically
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.print("Enter a word: ");
            String input = scanner.nextLine();
            
            if (input == null || input.isEmpty()) {
                System.out.println("Reversed word: (empty)");
                return;
            }
            
            // StringBuilder operates in O(n) without heap churn
            String reversed = new StringBuilder(input).reverse().toString();
            System.out.println("Reversed word: " + reversed);
        }
    }
}`,
    takeaways: [
      'Always observe 0-based indexing limits when traversing Java strings.',
      'Use StringBuilder for repeated string manipulations to protect performance.',
      'Manage I/O resources with try-with-resources to avoid resource leaks.'
    ]
  },

  cpp: {
    summary: 'Dangerous memory access: returns a pointer to a stack-allocated variable that is destroyed upon function return.',
    issues: [
      {
        id: 'cpp-1',
        type: 'Critical',
        line: 9,
        title: 'Dangling Pointer to Stack Memory',
        description: 'localArr lives in the local stack frame. When the function returns, that stack memory is deallocated, leading to undefined behavior.'
      },
      {
        id: 'cpp-2',
        type: 'Warning',
        line: 5,
        title: 'Variable Length Array (VLA) is Non-Standard',
        description: 'Variable length arrays are a C99 extension not supported in standard ISO C++. They risk stack overflows for large sizes.'
      },
      {
        id: 'cpp-3',
        type: 'Style',
        line: 2,
        title: 'Global "using namespace std;"',
        description: 'Importing the entire standard namespace into global scope can cause identifier collisions in larger codebases.'
      }
    ],
    explanation: 'Variables declared inside a function body reside in the "stack". Once the function finishes, its stack frame is reclaimed. Returning the address of a stack variable creates a "dangling pointer"—reading it in main() leads to garbage data or segmentation faults. Modern C++ standard containers like std::vector safely manage heap memory.',
    hints: [
      'Where does localArr reside in memory? On the stack or on the heap?',
      'What standard library container manages dynamically sized lists safely in C++?',
      'Consider std::vector<int>—it handles dynamic memory allocation and deallocation automatically.'
    ],
    improvedCode: `#include <iostream>
#include <vector>

// Modern C++ idiom: Return by value using std::vector
std::vector<int> createSequence(int size) {
    std::vector<int> sequence;
    sequence.reserve(size);
    for (int i = 0; i < size; ++i) {
        sequence.push_back((i + 1) * 10);
    }
    return sequence; // Move semantics make this fast and safe
}

int main() {
    std::vector<int> numbers = createSequence(5);
    if (!numbers.empty()) {
        std::cout << "First item: " << numbers[0] << "\\n";
    }
    return 0;
}`,
    takeaways: [
      'Never return pointers or references to local stack-allocated variables.',
      'Adopt RAII and standard containers like std::vector for safe memory handling.',
      'Avoid "using namespace std;" in header files and global scopes.'
    ]
  }
};

/**
 * Heuristic fallback for arbitrary custom code snippets
 */
export function generateHeuristicReview(code, language) {
  const lines = code.split('\n');
  const issues = [];
  const hints = [];
  const takeaways = [];

  // 1. Language-specific pattern checks
  if (language === 'python') {
    if (code.includes('range(len(')) {
      issues.push({
        id: 'h-py-1',
        type: 'Style',
        line: findLineNumber(lines, 'range(len('),
        title: 'Non-Idiomatic Indexing (range(len(...)))',
        description: 'Python is built for direct iteration. If you need both index and value, use enumerate(collection).'
      });
      hints.push('Try "for item in collection:" or "for i, item in enumerate(collection):".');
    }

    if (code.includes('/ len(') && !code.includes('if not') && !code.includes('if len(')) {
      issues.push({
        id: 'h-py-2',
        type: 'Critical',
        line: findLineNumber(lines, '/ len('),
        title: 'Unchecked Division by Collection Length',
        description: 'Dividing by the length of a collection without checking if it is non-empty can cause ZeroDivisionError.'
      });
      hints.push('Add a guard clause: "if not my_list: return 0" before computing the division.');
    }
  }

  if (language === 'javascript') {
    if (code.includes('==') && !code.includes('===')) {
      issues.push({
        id: 'h-js-1',
        type: 'Warning',
        line: findLineNumber(lines, '=='),
        title: 'Loose Equality (==) Operator',
        description: 'Loose equality allows automatic type conversion which can hide subtle bugs. Use strict equality (===).'
      });
      hints.push('Replace "==" with "===" to verify both type and value equality.');
    }

    if (code.includes('var ')) {
      issues.push({
        id: 'h-js-2',
        type: 'Style',
        line: findLineNumber(lines, 'var '),
        title: 'Legacy "var" Keyword',
        description: '"var" has function scope and can introduce hoisting bugs. Prefer block-scoped "let" and "const".'
      });
      hints.push('Convert "var" variables to "const" (default) or "let" (if reassigned).');
    }
  }

  if (language === 'java') {
    if (code.includes('Scanner') && !code.includes('.close()') && !code.includes('try (')) {
      issues.push({
        id: 'h-java-1',
        type: 'Warning',
        line: findLineNumber(lines, 'Scanner'),
        title: 'Potential Resource Leak on Scanner',
        description: 'Scanner instance is created without an explicit close() or try-with-resources statement.'
      });
      hints.push('Wrap the Scanner in a try-with-resources block: "try (Scanner sc = new Scanner(...)) { ... }".');
    }
  }

  if (language === 'cpp') {
    if (code.includes('using namespace std;')) {
      issues.push({
        id: 'h-cpp-1',
        type: 'Style',
        line: findLineNumber(lines, 'using namespace std;'),
        title: 'Namespace Pollution (using namespace std;)',
        description: 'Dumping the entire std namespace into global scope can cause unexpected identifier collisions.'
      });
      hints.push('Explicitly prefix standard symbols like "std::cout" and "std::vector".');
    }
  }

  // 2. Fallback when code looks clean or simple
  if (issues.length === 0) {
    issues.push({
      id: 'h-clean-1',
      type: 'Good Practice',
      line: 1,
      title: 'Valid Syntax Structure',
      description: 'No common beginner anti-patterns detected. The snippet structure is concise and logically ordered.'
    });
    hints.push('Test your logic with unusual inputs: null, empty collections, negative numbers, and boundary limits.');
    hints.push('Consider adding brief comments explaining the algorithm\'s expected runtime complexity (Big-O).');
  }

  takeaways.push('Edge-case testing is what separates amateur code from production-ready code.');
  takeaways.push('Small, focused functions with descriptive naming make code easier to test and review.');

  return {
    summary: `Analyzed ${lines.length} lines of ${language.toUpperCase()} code. Found ${issues.length} review items for pedagogical feedback.`,
    issues,
    explanation: `This review evaluated your ${language.toUpperCase()} snippet for fundamental software engineering practices: boundary safety, proper scoping, idiomatic syntax, and resource management. Practicing these principles will significantly strengthen your computer science foundations.`,
    hints: hints.length > 0 ? hints : ['Write a quick unit test checking the function\'s behavior with empty or null input.'],
    improvedCode: `// Refactored and formatted version of your ${language} snippet:\n${code}`,
    takeaways
  };
}

function findLineNumber(lines, substring) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(substring)) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Main Mock Review Engine Generator
 */
export function getMockReview(code, language) {
  const normalizedLang = language.toLowerCase();
  const trimmedCode = code.trim();

  // If the user submits one of the standard educational test cases, provide the curated review
  const isPythonPitfall = normalizedLang === 'python' && (trimmedCode.includes('def calculate_average') || trimmedCode.includes('ZeroDivisionError'));
  const isJsPitfall = normalizedLang === 'javascript' && (trimmedCode.includes('findStudent') || trimmedCode.includes('students.length'));
  const isJavaPitfall = normalizedLang === 'java' && (trimmedCode.includes('StringReverser') || trimmedCode.includes('input.length()'));
  const isCppPitfall = normalizedLang === 'cpp' && (trimmedCode.includes('createSequence') || trimmedCode.includes('localArr'));

  if (isPythonPitfall && CANONICAL_REVIEWS.python) {
    return CANONICAL_REVIEWS.python;
  }
  if (isJsPitfall && CANONICAL_REVIEWS.javascript) {
    return CANONICAL_REVIEWS.javascript;
  }
  if (isJavaPitfall && CANONICAL_REVIEWS.java) {
    return CANONICAL_REVIEWS.java;
  }
  if (isCppPitfall && CANONICAL_REVIEWS.cpp) {
    return CANONICAL_REVIEWS.cpp;
  }

  // Otherwise, run heuristic mock analysis
  return generateHeuristicReview(code, normalizedLang);
}
