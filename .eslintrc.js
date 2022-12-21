// eslint-disable-next-line notice/notice
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['notice'],
  "ignorePatterns": ["**/dist"],
  rules: {
    // notice
    'notice/notice': ['error', { templateFile: 'scripts/file-header.ts' }],
  },
};
