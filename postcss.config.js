const webpack = require('webpack');

module.exports = {
	plugins: [
    require('postcss-easy-import'),
    require('postcss-simple-vars')(),
    require('postcss-focus')(),
    require('postcss-cssnext'),
    require('postcss-reporter')({
      clearMessages: true
    })
	]
};
