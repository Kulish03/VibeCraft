// Supported canonical programming languages
export const SUPPORTED_LANGUAGES = ['python', 'javascript', 'java', 'cpp'];

// Normalization lookup mapping common aliases to canonical names
export const LANGUAGE_ALIASES = {
  python: 'python',
  py: 'python',
  javascript: 'javascript',
  js: 'javascript',
  node: 'javascript',
  nodejs: 'javascript',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  cplusplus: 'cpp'
};

// Maximum allowed code size in characters (~15 KB)
export const MAX_CODE_LENGTH = 15000;
