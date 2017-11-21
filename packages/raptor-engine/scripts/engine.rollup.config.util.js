const COMPAT_SUFFIX = "_compat";
const DEBUG_SUFFIX = "_debug";
const PROD_SUFFIX = ".min";

function generateTargetName({ format, prod, target, proddebug }){
    return [
        'engine',
        proddebug ? DEBUG_SUFFIX : '',
        prod ? '.min' : '',
        '.js'
    ].join('');
}

module.exports = {
    COMPAT_SUFFIX,
    DEBUG_SUFFIX,
    PROD_SUFFIX,
    generateTargetName: generateTargetName
}

