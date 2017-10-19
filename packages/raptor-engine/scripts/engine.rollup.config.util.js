const COMPAT_SUFFIX = "_compat";
const DEBUG_SUFFIX = "_debug";
const PROD_SUFFIX = ".min";
const TEST_SUFFIX = "_test";

function generateTargetName({ format, prod, target, test, proddebug}){
    return [
        'engine',
        test ? TEST_SUFFIX : '',
        proddebug ? DEBUG_SUFFIX : '',
        prod ? '.min' : '',
        '.js'
    ].join('');
}

module.exports = {
    COMPAT_SUFFIX,
    DEBUG_SUFFIX,
    PROD_SUFFIX,
    TEST_SUFFIX,
    generateTargetName: generateTargetName
}

