const path = require('path');
const { pick } = require('lodash');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const { execSync } = require('child_process');

/**
 * @param  {...string} paths
 * @returns {string}
 */
const relPath = (...paths) => path.resolve(__dirname, ...paths.map((p) => p.replaceAll(/[\\/]/g, path.sep)));
const libPath = (...paths) => relPath('lib', ...paths);

module.exports = (env) => {
  /** @type {import('webpack').Configuration} */
  const config = {
    devServer: {
      // contentBase: relPath('dist'),
      compress: true,
      port: 9000,
      hot: true,
      open: true,
      onBeforeSetupMiddleware() {
        execSync('npx grunt build', { stdio: 'inherit' });
      },
    },
    mode: 'production',
    devtool: 'source-map',
    entry: {
      'kityminder-editor': './editor.js',
      'kityminder-viewer': './viewer.js',
    },
    output: {
      path: relPath('dist'),
      filename: '[name].js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: false },
            },
          ],
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: false },
            },
            {
              loader: 'less-loader',
              options: { sourceMap: false },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[ext]',
          },
        },
        {
          test: /\.(eot|ttf|woff2?|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[ext]',
          },
        },
        {
          test: /ui-codemirror\.js$/,
          use: ['ng-annotate-loader'],
        },
        {
          test: /\.(js|mjs)$/,
          include: /node_modules[\\/](@angular|rxjs)[\\/]/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/plugin-transform-class-static-block'],
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    resolve: {
      alias: {
        editor$: relPath('src/expose-editor.js'),
        hotbox$: libPath('hotbox/hotbox.js'),
        'color-picker$': libPath('color-picker/dist/color-picker.js'),
      },
      fallback: {
        os: require.resolve('os-browserify/browser'),
      },
      extensions: ['.tsx', '.ts', '.js']
    },
    performance: {
      hints: false,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          defaultVendors: false,
          core: {
            name: 'kityminder-core',
            priority: 1,
            test: /[\\/]node_modules[\\/](kity|kityminder-core)[\\/]/,
          },
        },
      },
    },
    plugins: [
      new WebpackShellPluginNext({
        onBuildStart: {
          scripts: ['npx grunt build'],
          blocking: true,
          parallel: false,
        },
      }),
      new MiniCssExtractPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new DefinePlugin({
        'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_ENV === 'development'),
        'process.env': JSON.stringify(pick(process.env, ['NODE_ENV', 'DEBUG'])),
        'process.argv': JSON.stringify([]),
        'process.stdout': JSON.stringify({}),
        'process.stderr': JSON.stringify({}),
        'process.platform': JSON.stringify(undefined),
      }),
      new ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.CodeMirror': 'codemirror',
      }),
      new CopyPlugin({
        patterns: [
          {
            from: relPath('node_modules/kityminder-core/dist/kityminder.core.css'),
            to: 'kityminder-core.css',
          },
        ],
      }),
    ],
  };
  return config;
};
