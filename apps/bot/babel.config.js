const plugins = ['transform-runtime', 'lodash'];

// 生产环境移除console
if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
}

module.exports = {
    presets: [['@babel/preset-env']],
    plugins
};
