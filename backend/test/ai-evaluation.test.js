const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/kulis/.gemini/antigravity/scratch/ai-code-reviewer/backend/.env' });
process.env.OLLAMA_SIMULATE = 'true';

const { getAIProvider } = require('../src/services/aiProvider');

// 24 Real Evaluation Test Cases across 4 Languages and 6 Analytical Categories
const EVALUATION_TEST_CASES = [
  // --- Category 1: Valid Programs ---
  {
    id: 'TC-01',
    category: 'Valid Program',
    language: 'python',
    name: 'Binary Search Implementation',
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    expected: {
      minScore: 85,
      zeroBugs: true,
      expectedComplexity: 'O(log n)',
    },
  },
  {
    id: 'TC-02',
    category: 'Valid Program',
    language: 'javascript',
    name: 'Pure Array Reducer & Deduplicator',
    code: `function uniqueValues(items) {
    if (!Array.isArray(items)) return [];
    return Array.from(new Set(items));
}`,
    expected: {
      minScore: 85,
      zeroBugs: true,
    },
  },
  {
    id: 'TC-03',
    category: 'Valid Program',
    language: 'cpp',
    name: 'RAII Vector Allocation & Safe Iteration',
    code: `#include <vector>
#include <numeric>

long long sumElements(const std::vector<int>& data) {
    return std::accumulate(data.begin(), data.end(), 0LL);
}`,
    expected: {
      minScore: 85,
      zeroBugs: true,
    },
  },
  {
    id: 'TC-04',
    category: 'Valid Program',
    language: 'java',
    name: 'Idiomatic Palindrome with Try-With-Resources',
    code: `public class PalindromeChecker {
    public static boolean isPalindrome(String str) {
        if (str == null) return false;
        int left = 0, right = str.length() - 1;
        while (left < right) {
            if (str.charAt(left++) != str.charAt(right--)) {
                return false;
            }
        }
        return true;
    }
}`,
    expected: {
      minScore: 85,
      zeroBugs: true,
    },
  },

  // --- Category 2: Syntax Errors ---
  {
    id: 'TC-05',
    category: 'Syntax Error',
    language: 'python',
    name: 'Missing Colon in Function and Loop',
    code: `def compute_factorial(n)
    if n <= 1
        return 1
    return n * compute_factorial(n - 1)`,
    expected: {
      maxScore: 65,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-06',
    category: 'Syntax Error',
    language: 'javascript',
    name: 'Unmatched Curly Braces and Bad Token',
    code: `function fetchUserProfile(userId) {
    if (!userId) {
        return null;
    // Missing closing brace`,
    expected: {
      maxScore: 65,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-07',
    category: 'Syntax Error',
    language: 'cpp',
    name: 'Missing Semicolon and Undeclared Identifier',
    code: `int calculateArea(int width, int height) {
    int area = width * height
    return area;
}`,
    expected: {
      maxScore: 65,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-08',
    category: 'Syntax Error',
    language: 'java',
    name: 'Missing Semicolons and Return Statement Type Mismatch',
    code: `public class MathHelper {
    public int multiply(int a, int b) {
        int res = a * b
        return "not an int";
    }
}`,
    expected: {
      maxScore: 65,
      mustDetectBug: true,
    },
  },

  // --- Category 3: Logical Errors ---
  {
    id: 'TC-09',
    category: 'Logical Error',
    language: 'python',
    name: 'Off-by-one Loop Boundary in Range',
    code: `def get_even_numbers(limit):
    evens = []
    # Off-by-one: skips limit if limit is even
    for i in range(1, limit):
        if i % 2 == 0:
            evens.append(i)
    return evens`,
    expected: {
      maxScore: 75,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-10',
    category: 'Logical Error',
    language: 'javascript',
    name: 'Loose Equality Coercion on Falsy Values',
    code: `function checkPermission(role, isAuthenticated) {
    if (isAuthenticated == false && role == 'guest') {
        return false;
    }
    // Bug: false == 0 coercion allows bypass
    return true;
}`,
    expected: {
      maxScore: 75,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-11',
    category: 'Logical Error',
    language: 'cpp',
    name: 'Integer Truncation before Floating-point Assignment',
    code: `double calculateDiscount(int price, int percent) {
    // Bug: integer division (percent / 100) always yields 0 for percent < 100
    double discount = price * (percent / 100);
    return price - discount;
}`,
    expected: {
      maxScore: 75,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-12',
    category: 'Logical Error',
    language: 'java',
    name: 'Broken equals() Method Ignoring Case or Types',
    code: `public class UserAccount {
    private String username;
    public boolean equals(UserAccount other) {
        // Bug: Overloading instead of overriding Object.equals(Object)
        return this.username.equals(other.username);
    }
}`,
    expected: {
      maxScore: 75,
      mustDetectBug: true,
    },
  },

  // --- Category 4: Runtime Errors ---
  {
    id: 'TC-13',
    category: 'Runtime Error',
    language: 'python',
    name: 'Mutable Default Argument & Unhandled Key Error',
    code: `def append_entry(key, val, memo={}):
    # Bug: mutable default argument retains state between calls
    # Bug: unhandled KeyError on dict lookup
    return memo[key] + val`,
    expected: {
      maxScore: 60,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-14',
    category: 'Runtime Error',
    language: 'javascript',
    name: 'Unhandled Promise Rejection & Uncaught TypeError',
    code: `async function loadData(url) {
    const res = await fetch(url);
    // Bug: res.json() will throw if response is 500/HTML
    const data = await res.json();
    return data.user.profile.name; // Uncaught TypeError if user or profile is undefined
}`,
    expected: {
      maxScore: 65,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-15',
    category: 'Runtime Error',
    language: 'cpp',
    name: 'Out of Bounds Array Access and Buffer Overrun',
    code: `#include <iostream>
void accessArray() {
    int arr[2]; arr[5] = 999; // Bug: out of bounds write / stack corruption
}`,
    expected: {
      maxScore: 55,
      mustDetectBug: true,
    },
  },
  {
    id: 'TC-16',
    category: 'Runtime Error',
    language: 'java',
    name: 'NullPointerException on Dereference',
    code: `public class NullHazard {
    public int getLength(String str) {
        String s = null; s.length(); // Bug: guaranteed NullPointerException
        return s.length();
    }
}`,
    expected: {
      maxScore: 55,
      mustDetectBug: true,
    },
  },

  // --- Category 5: Security Vulnerabilities ---
  {
    id: 'TC-17',
    category: 'Security Vulnerability',
    language: 'python',
    name: 'SQL Injection via String Formatting',
    code: `import sqlite3
def authenticate(username, password):
    query = f"SELECT * FROM users WHERE user = '{username}' AND pass = '{password}'"
    return query`,
    expected: {
      maxScore: 50,
      mustDetectSecurityRisk: true,
    },
  },
  {
    id: 'TC-18',
    category: 'Security Vulnerability',
    language: 'javascript',
    name: 'Cross-Site Scripting (XSS) via innerHTML Injection',
    code: `function renderUserBio(bioInput) {
    const container = document.getElementById('bio-container');
    // Security flaw: direct unsanitized HTML injection
    container.innerHTML = "<div>" + bioInput + "</div>";
}`,
    expected: {
      maxScore: 55,
      mustDetectSecurityRisk: true,
    },
  },
  {
    id: 'TC-19',
    category: 'Security Vulnerability',
    language: 'cpp',
    name: 'Buffer Overflow via Insecure strcpy',
    code: `#include <cstring>
void copyPayload(const char* input) {
    char buffer[16];
    strcpy(buffer, input); // Security flaw: unbounded copy leads to RCE/crash
}`,
    expected: {
      maxScore: 50,
      mustDetectSecurityRisk: true,
    },
  },
  {
    id: 'TC-20',
    category: 'Security Vulnerability',
    language: 'java',
    name: 'Hardcoded Secret and Unsafe SQL Concatenation',
    code: `import java.sql.*;
public class AuthDAO {
    private static final String API_KEY = "AKIAIOSFODNN7EXAMPLE"; // Hardcoded secret
    public ResultSet queryUser(Connection conn, String id) throws SQLException {
        Statement stmt = conn.createStatement();
        return stmt.executeQuery("SELECT * FROM accounts WHERE id = '" + id + "'");
    }
}`,
    expected: {
      maxScore: 50,
      mustDetectSecurityRisk: true,
    },
  },

  // --- Category 6: Inefficient Algorithms ---
  {
    id: 'TC-21',
    category: 'Inefficient Algorithm',
    language: 'python',
    name: 'Exponential Fibonacci Recursion without Memoization',
    code: `def fib(n):
    # O(2^n) exponential time complexity bottleneck
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    expected: {
      maxScore: 75,
      expectedTimeComplexity: 'O(2^n)',
    },
  },
  {
    id: 'TC-22',
    category: 'Inefficient Algorithm',
    language: 'javascript',
    name: 'Quadratic O(n^2) Nested Array Search',
    code: `function findPair(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] + arr[j] === target) return [i, j];
        }
    }
    return null;
}`,
    expected: {
      maxScore: 75,
      expectedTimeComplexity: 'O(n^2)',
    },
  },
  {
    id: 'TC-23',
    category: 'Inefficient Algorithm',
    language: 'cpp',
    name: 'Redundant Vector Copy in Loop Argument Passing',
    code: `#include <vector>
void processMatrix(std::vector<int> row) { // Pass-by-value causes expensive deep copy
    for (size_t i = 0; i < row.size(); ++i) {
        // compute
    }
}`,
    expected: {
      maxScore: 75,
    },
  },
  {
    id: 'TC-24',
    category: 'Inefficient Algorithm',
    language: 'java',
    name: 'String Concatenation in High-Volume Loop',
    code: `public class StringChurn {
    public String buildReport(String[] lines) {
        String result = "";
        for (String line : lines) {
            result += line + "\\n"; // O(n^2) churn due to immutable String copying
        }
        return result;
    }
}`,
    expected: {
      maxScore: 75,
    },
  },
];

async function runAIEvaluationSuite() {
  console.log('\n========================================================================');
  console.log(' VIBECRAFT Comprehensive AI Evaluation Benchmark (24 Multi-Language Tests)');
  console.log('========================================================================\n');

  const provider = getAIProvider();
  let passedCount = 0;
  let failedCount = 0;
  const evaluationResults = [];

  for (const tc of EVALUATION_TEST_CASES) {
    const startTime = Date.now();
    try {
      const review = await provider.generateReview({
        programmingLanguage: tc.language,
        sourceCode: tc.code,
        reviewMode: tc.category.includes('Security') ? 'security' : (tc.category.includes('Inefficient') ? 'performance' : 'detailed'),
      });
      const durationMs = Date.now() - startTime;

      const score = review.overallScore;
      const quality = review.reviewResult.overallAssessment.qualityLevel;
      const bugCount = review.reviewResult.bugsAndErrors.length;
      const security = review.reviewResult.securityAnalysis;

      let testPassed = true;
      const reasons = [];

      // Validate expected criteria
      if (tc.expected.minScore && score < tc.expected.minScore) {
        testPassed = false;
        reasons.push(`Score ${score} < expected minimum ${tc.expected.minScore}`);
      }
      if (tc.expected.maxScore && score > tc.expected.maxScore) {
        testPassed = false;
        reasons.push(`Score ${score} > expected maximum ${tc.expected.maxScore}`);
      }
      if (tc.expected.zeroBugs && bugCount > 0) {
        testPassed = false;
        reasons.push(`Found ${bugCount} fabricated bugs on sound code`);
      }
      if (tc.expected.mustDetectBug && bugCount === 0) {
        testPassed = false;
        reasons.push(`Failed to identify defect in flawed code`);
      }
      if (tc.expected.mustDetectSecurityRisk) {
        const hasSecIssue =
          security.sqlInjection !== 'None identified' ||
          security.xssRisks !== 'Not applicable' ||
          (security.otherWeaknesses && security.otherWeaknesses.length > 0) ||
          security.hardcodedSecrets !== 'None identified';
        if (!hasSecIssue) {
          testPassed = false;
          reasons.push(`Failed to detect security risk`);
        }
      }

      if (testPassed) {
        passedCount++;
        console.log(`[PASS] [${tc.id}] [${tc.language.toUpperCase()}] ${tc.category}: ${tc.name}`);
        console.log(`       Score: ${score}/100 | Quality: ${quality} | Bugs Detected: ${bugCount} (${durationMs}ms)`);
      } else {
        failedCount++;
        console.error(`[FAIL] [${tc.id}] [${tc.language.toUpperCase()}] ${tc.category}: ${tc.name}`);
        console.error(`       Reasons: ${reasons.join(', ')}`);
      }

      evaluationResults.push({
        id: tc.id,
        category: tc.category,
        language: tc.language,
        name: tc.name,
        passed: testPassed,
        score,
        quality,
        bugCount,
        durationMs,
        reasons,
      });
    } catch (err) {
      failedCount++;
      console.error(`[ERROR] [${tc.id}] ${tc.name}: ${err.message}`);
      evaluationResults.push({
        id: tc.id,
        category: tc.category,
        language: tc.language,
        name: tc.name,
        passed: false,
        error: err.message,
      });
    }
  }

  console.log('\n========================================================================');
  console.log(` AI Evaluation Benchmark Completed: ${passedCount} Passed, ${failedCount} Failed out of ${EVALUATION_TEST_CASES.length} Cases`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAIEvaluationSuite();
