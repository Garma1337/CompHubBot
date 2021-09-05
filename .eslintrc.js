module.exports = {
  env: {
    browser: false,
    es6: true
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      classes: true,
    }
  },
  rules: {
    "prefer-destructuring": ["error", {"object": true, "array": false}],
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "no-await-in-loop": "off",
    "no-restricted-syntax": "off",
  },
};
