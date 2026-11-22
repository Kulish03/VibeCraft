const mongoose = require('mongoose');

const reviewResultSchema = new mongoose.Schema(
  {
    // Section 1: Overall Assessment
    overallAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    summary: {
      type: String,
      default: '',
    },

    // Section 2: Bugs and Errors
    bugsAndErrors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    bugs: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    syntaxErrors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    logicalErrors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    runtimeErrors: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Section 3: Security Analysis
    securityAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    securityIssues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Section 4: Code Quality
    codeQuality: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    readabilityAndMaintainability: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },

    // Section 5: Performance Analysis
    performanceAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    optimizationSuggestions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Section 6: Complexity Analysis
    complexityAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    timeComplexity: {
      type: String,
      default: 'O(1)',
    },
    spaceComplexity: {
      type: String,
      default: 'O(1)',
    },

    // Section 7: Learning Assistance
    learningAssistance: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    debuggingHints: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const codeReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Review',
    },
    programmingLanguage: {
      type: String,
      required: [true, 'Programming language is required'],
      trim: true,
      lowercase: true,
      enum: {
        values: ['cpp', 'c++', 'java', 'python', 'javascript', 'js'],
        message: '{VALUE} is not a supported programming language',
      },
    },
    reviewMode: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['basic', 'detailed', 'security', 'performance'],
      default: 'detailed',
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
    },
    reviewInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    reviewResult: {
      type: reviewResultSchema,
      required: true,
      default: () => ({}),
    },
    overallScore: {
      type: Number,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    chatMessages: {
      type: [chatMessageSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

codeReviewSchema.index({ userId: 1, createdAt: -1 });
codeReviewSchema.index({ userId: 1, programmingLanguage: 1, createdAt: -1 });
codeReviewSchema.index({ userId: 1, reviewMode: 1, createdAt: -1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);
