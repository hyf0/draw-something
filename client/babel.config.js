// eslint-disable-next-line no-undef
module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    // --
    'react-hot-loader/babel',
    [
      // 按需引入 material 组件，图标
      'babel-plugin-transform-imports',
      {
        '@material-ui/core': {
          // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
          transform: '@material-ui/core/esm/${member}',
          preventFullImport: true,
        },
        '@material-ui/icons': {
          // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
          transform: '@material-ui/icons/esm/${member}',
          preventFullImport: true,
        },
      },
    ],
  ];

  return {
    presets,
    plugins,
  };
};
