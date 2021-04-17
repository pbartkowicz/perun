module.exports = {
    env: {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'jest/globals': true
    },
    extends: [
        'standard',
        'plugin:jest/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12
    },
    plugins: ['jest'],
    root: true,
    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        semi: ['error', 'never']
    }
}
