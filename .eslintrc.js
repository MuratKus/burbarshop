module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Critical deployment blockers - keep as errors
    'react/no-unescaped-entities': 'error',
    
    // Important but not deployment blocking
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    
    // Development helpers - warnings only
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    
    // Next.js specific
    '@next/next/no-html-link-for-pages': 'warn',
    '@next/next/no-sync-scripts': 'warn'
  },
  overrides: [
    {
      // Relax rules for scripts and config files
      files: ['scripts/**/*.js', '*.config.js', 'jest.*.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
}