/* eslint-disable no-template-curly-in-string */
module.exports = (api) => {
    api.cache(true);
    return {
        "presets": [
            "react-app",
        ],
        plugins: [
            [
                'babel-plugin-transform-imports',
                {
                    '@material-ui/core': {
                        // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
                        'transform': '@material-ui/core/esm/${member}',
                        'preventFullImport': true
                    },
                    '@material-ui/icons': {
                        // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
                        'transform': '@material-ui/icons/esm/${member}',
                        'preventFullImport': true
                    }
                }
            ],
            ["react-hot-loader/babel"],
        ],
    }
}
