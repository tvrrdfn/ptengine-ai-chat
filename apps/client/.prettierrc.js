module.exports = {
    printWidth: 100, // 一行的字符数，如果超过会进行换行，默认为80
    tabWidth: 4, // tab缩进大小,默认为2
    useTabs: false, // 使用tab缩进，默认false
    semi: true, // 使用分号, 默认true
    /**
     * 行尾逗号,默认none,可选 none|es5|all
     * es5 包括es5中的数组、对象
     * all 包括函数对象等所有可选
     */
    trailingComma: 'none',
    singleQuote: true, // 使用单引号, 默认false(在jsx中配置无效, 默认都是双引号)
    /**
     * 对象中的空格 默认true
     * true: { foo: bar }
     * false: {foo: bar}
     */
    bracketSpacing: true,
    /**
     * JSX标签闭合位置 默认false
     * false:
     * <div
     *  className=""
     *  style={{}}
     * >
     * true:
     * <div
     *  className=""
     * style={{}} >
     */
    jsxBracketSameLine: false,
    /**
     * 箭头函数参数括号 默认avoid 可选 avoid| always
     * avoid 能省略括号的时候就省略 例如x => x
     * always 总是有括号
     */
    arrowParens: 'always',
    vueIndentScriptAndStyle: false, // vue 文件 script 和 style 标签缩进，默认false
    endOfLine: 'lf' // 强制使用 unix 风格的换行符
};
