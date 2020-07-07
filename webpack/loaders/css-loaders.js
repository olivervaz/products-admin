const miniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV === 'development';

const styleLoader = {
  loader: 'style-loader'
};

const miniCssExtractPluginLoader = {
  loader: miniCssExtractPlugin.loader,
  options: {
    chunkFilename: '[id].css'
  }
};

module.exports = [
  devMode ? { ...styleLoader } : { ...miniCssExtractPluginLoader },
  {
    loader: 'css-loader'
  },
  {
    loader: 'sass-loader',
    options:{
      implementation:require('sass'),
      sourceMap: devMode,
    }
  }
];
