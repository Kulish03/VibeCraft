const mongoose = require('mongoose');
const CodeReview = require('../models/CodeReview');
const {
  analyzeCodeWithOllama,
  chatFollowUpWithOllama,
  compareCodeWithOllama,
} = require('../services/ollamaService');

// Supported language normalization map
const LANGUAGE_MAP = {
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
};

// Supported review modes
const VALID_MODES = ['basic', 'detailed', 'security', 'performance'];

// Maximum allowed code character length
const MAX_CODE_LENGTH = 50000;

/**
 * @desc    Submit source code for AI-powered review
 * @route   POST /api/reviews
 * @access  Private (JWT)
 */
const submitReview = async (req, res, next) => {
  try {
    const { title, programmingLanguage, sourceCode, reviewMode, reviewInstructions } = req.body;

    if (!programmingLanguage || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both programmingLanguage and sourceCode.',
      });
    }

    if (typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Source code cannot be empty.',
      });
    }

    if (typeof programmingLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Programming language must be a string.',
      });
    }

    if (title && (typeof title !== 'string' || title.length > 200)) {
      return res.status(400).json({
        success: false,
        message: 'Title must be a string with a maximum of 200 characters.',
      });
    }

    if (reviewInstructions && (typeof reviewInstructions !== 'string' || reviewInstructions.length > 2000)) {
      return res.status(400).json({
        success: false,
        message: 'Review instructions cannot exceed 2000 characters.',
      });
    }

    if (sourceCode.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Source code exceeds the maximum permitted limit of ${MAX_CODE_LENGTH} characters.`,
      });
    }

    const normalizedLang = LANGUAGE_MAP[programmingLanguage.toLowerCase().trim()];
    if (!normalizedLang) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: '${programmingLanguage}'. Supported languages are: C++, Java, Python, JavaScript.`,
      });
    }

    const selectedMode = (typeof reviewMode === 'string' && VALID_MODES.includes(reviewMode.toLowerCase().trim()))
      ? reviewMode.toLowerCase().trim()
      : 'detailed';

    // Delegate to Ollama AI service (strictly static review - code is NEVER executed)
    const { overallScore, reviewResult } = await analyzeCodeWithOllama({
      programmingLanguage: normalizedLang,
      sourceCode: sourceCode.trim(),
      reviewMode: selectedMode,
      reviewInstructions: typeof reviewInstructions === 'string' ? reviewInstructions.trim() : '',
    });

    const newReview = await CodeReview.create({
      userId: req.user._id,
      title: title && title.trim().length > 0 ? title.trim() : `${normalizedLang.toUpperCase()} (${selectedMode}) Review`,
      programmingLanguage: normalizedLang,
      reviewMode: selectedMode,
      sourceCode: sourceCode.trim(),
      reviewInstructions: typeof reviewInstructions === 'string' ? reviewInstructions.trim() : '',
      reviewResult,
      overallScore,
    });

    return res.status(201).json({
      success: true,
      message: 'Code review analyzed and saved successfully.',
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch review history with multi-dimensional filtering (language, date, mode)
 * @route   GET /api/reviews
 * @access  Private (JWT)
 */
const getReviewHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    // 1. Language filter
    if (req.query.language && req.query.language !== 'all') {
      const normalized = LANGUAGE_MAP[req.query.language.toLowerCase().trim()];
      if (normalized) {
        query.programmingLanguage = normalized;
      }
    }

    // 2. Review Mode filter
    if (req.query.mode && req.query.mode !== 'all' && VALID_MODES.includes(req.query.mode.toLowerCase().trim())) {
      query.reviewMode = req.query.mode.toLowerCase().trim();
    }

    // 3. Date range filter
    if (req.query.date && req.query.date !== 'all') {
      const now = new Date();
      if (req.query.date === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.createdAt = { $gte: startOfDay };
      } else if (req.query.date === 'week') {
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: last7Days };
      } else if (req.query.date === 'month') {
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: last30Days };
      }
    }

    // 4. Keyword search
    if (req.query.search && req.query.search.trim().length > 0) {
      query.$or = [
        { title: { $regex: req.query.search.trim(), $options: 'i' } },
        { sourceCode: { $regex: req.query.search.trim(), $options: 'i' } },
      ];
    }

    const total = await CodeReview.countDocuments(query);
    // Optimized projection omitting heavy chatMessages history and using lean()
    const reviews = await CodeReview.find(query)
      .select('-chatMessages')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch aggregated review insights and metrics
 * @route   GET /api/reviews/insights
 * @access  Private (JWT)
 */
const getReviewInsights = async (req, res, next) => {
  try {
    const reviews = await CodeReview.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return res.status(200).json({
        success: true,
        insights: {
          totalReviews: 0,
          averageScore: 0,
          totalIssues: 0,
          issuesBySeverity: { Critical: 0, High: 0, Medium: 0, Low: 0 },
          languageDistribution: { python: 0, javascript: 0, cpp: 0, java: 0 },
          modeDistribution: { detailed: 0, basic: 0, security: 0, performance: 0 },
          qualityDistribution: { Excellent: 0, Good: 0, 'Needs Improvement': 0, 'Critical Issues': 0 },
          activityOverTime: [],
        },
      });
    }

    let scoreSum = 0;
    const issuesBySeverity = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const languageDistribution = { python: 0, javascript: 0, cpp: 0, java: 0 };
    const modeDistribution = { detailed: 0, basic: 0, security: 0, performance: 0 };
    const qualityDistribution = { Excellent: 0, Good: 0, 'Needs Improvement': 0, 'Critical Issues': 0 };
    const activityMap = {};

    reviews.forEach((r) => {
      scoreSum += r.overallScore || 0;

      // Language
      if (languageDistribution[r.programmingLanguage] !== undefined) {
        languageDistribution[r.programmingLanguage]++;
      } else {
        languageDistribution[r.programmingLanguage] = 1;
      }

      // Mode
      const mode = r.reviewMode || 'detailed';
      if (modeDistribution[mode] !== undefined) {
        modeDistribution[mode]++;
      }

      // Quality level
      const score = r.overallScore || 0;
      if (score >= 90) qualityDistribution.Excellent++;
      else if (score >= 75) qualityDistribution.Good++;
      else if (score >= 50) qualityDistribution['Needs Improvement']++;
      else qualityDistribution['Critical Issues']++;

      // Issue count by severity
      const bugs = r.reviewResult?.bugsAndErrors || [];
      bugs.forEach((b) => {
        const sev = b.severity || 'Medium';
        if (issuesBySeverity[sev] !== undefined) {
          issuesBySeverity[sev]++;
        } else {
          issuesBySeverity[sev] = 1;
        }
      });

      // Date activity (YYYY-MM-DD)
      const dateKey = new Date(r.createdAt).toISOString().split('T')[0];
      if (!activityMap[dateKey]) {
        activityMap[dateKey] = { date: dateKey, count: 0, scoreSum: 0 };
      }
      activityMap[dateKey].count++;
      activityMap[dateKey].scoreSum += r.overallScore || 0;
    });

    const totalIssues = Object.values(issuesBySeverity).reduce((a, b) => a + b, 0);
    const averageScore = Math.round(scoreSum / totalReviews);

    const activityOverTime = Object.values(activityMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((item) => ({
        date: item.date,
        count: item.count,
        avgScore: Math.round(item.scoreSum / item.count),
      }));

    return res.status(200).json({
      success: true,
      insights: {
        totalReviews,
        averageScore,
        totalIssues,
        issuesBySeverity,
        languageDistribution,
        modeDistribution,
        qualityDistribution,
        activityOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare two versions of code or two review snapshots
 * @route   POST /api/reviews/compare
 * @access  Private (JWT)
 */
const compareCodeReviews = async (req, res, next) => {
  try {
    const { baseReviewId, comparisonReviewId, originalCode, revisedCode, programmingLanguage } = req.body;

    let baseCode = originalCode;
    let newCode = revisedCode;
    let baseReview = null;
    let lang = programmingLanguage || 'python';

    // If review IDs were provided, fetch them from DB
    if (baseReviewId) {
      if (!mongoose.Types.ObjectId.isValid(baseReviewId)) {
        return res.status(400).json({ success: false, message: 'Invalid base review ID.' });
      }
      baseReview = await CodeReview.findById(baseReviewId);
      if (!baseReview) {
        return res.status(404).json({ success: false, message: 'Base code review not found.' });
      }
      if (baseReview.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to base review.' });
      }
      baseCode = baseReview.sourceCode;
      lang = baseReview.programmingLanguage;
    }

    if (comparisonReviewId) {
      if (!mongoose.Types.ObjectId.isValid(comparisonReviewId)) {
        return res.status(400).json({ success: false, message: 'Invalid comparison review ID.' });
      }
      const compReview = await CodeReview.findById(comparisonReviewId);
      if (!compReview) {
        return res.status(404).json({ success: false, message: 'Comparison code review not found.' });
      }
      if (compReview.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to comparison review.' });
      }
      newCode = compReview.sourceCode;
    }

    if (!baseCode || !newCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both original and revised code to perform comparison.',
      });
    }

    if (baseCode.length > MAX_CODE_LENGTH || newCode.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Comparison code exceeds the maximum permitted limit of ${MAX_CODE_LENGTH} characters.`,
      });
    }

    const comparison = await compareCodeWithOllama({
      originalCode: baseCode,
      revisedCode: newCode,
      originalReview: baseReview,
      programmingLanguage: lang,
    });

    return res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Follow-up Chat on an existing code review
 * @route   POST /api/reviews/:id/chat
 * @access  Private (JWT)
 */
const chatFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID format.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a non-empty question.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters.' });
    }

    const review = await CodeReview.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Code review not found.' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this review.' });
    }

    // Call AI service with context of the review
    const { reply } = await chatFollowUpWithOllama({
      review,
      message: message.trim(),
      chatHistory: review.chatMessages || [],
    });

    // Append to review conversation thread and persist
    review.chatMessages.push({ role: 'user', content: message.trim() });
    review.chatMessages.push({ role: 'assistant', content: reply });
    await review.save();

    return res.status(200).json({
      success: true,
      reply,
      chatMessages: review.chatMessages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch a single review by ID
 * @route   GET /api/reviews/:id
 * @access  Private (JWT)
 */
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.',
      });
    }

    const review = await CodeReview.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Code review not found.',
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this review.',
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review by ID
 * @route   DELETE /api/reviews/:id
 * @access  Private (JWT)
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.',
      });
    }

    const review = await CodeReview.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Code review not found.',
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this review.',
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Code review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getReviewHistory,
  getReviewInsights,
  compareCodeReviews,
  chatFollowUp,
  getReviewById,
  deleteReview,
};
