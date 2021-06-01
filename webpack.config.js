const path = require('path');

module.exports = {
  entry: {
    app: './src/index.tsx',
    daemon: './src/Daemon.tsx'
  },
  module: {
    rules: [
        {
            test: /\.tsx?$/,
            loader: 'babel-loader',
            options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
              }
          },
          {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
          },
          {
            test: /\.(png|jpg)$/,
            loader: 'url-loader'
          }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: "pyramid_notify"
  },
};
