module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current', browsers: '> 2%, not dead' } }],
    '@babel/preset-typescript',
  ],
};
