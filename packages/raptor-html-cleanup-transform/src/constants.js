const utils = require('./utils');

const isUnaryTag = utils.makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr',
    true
);

module.exports = {
    isUnaryTag,

    DEFAULT_DIRECTIVE_SYMBOL: ':',
    DEFAULT_DIRECTIVE_PREFIX: 'd',
    EVENT_HANDLER_SYMBOL: '@',
    EVENT_HANDLER_DIRECTIVE_PREFIX: 'bind',

    EXPRESSION_SYMBOL_START: '{',
    EXPRESSION_SYMBOL_END: '}',

    VALID_EXPRESSION_REGEX: /^{.+}$/,
    POTENTIAL_EXPRESSION_REGEX: /^.?{.+}.*$/,
};
