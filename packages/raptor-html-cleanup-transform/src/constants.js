/* eslint-env node */
const utils = require('./utils');

module.exports.isUnaryTag = utils.makeMap(
'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr',
  true
)

module.exports.EVENT_HANDLER_SYMBOL = '@';
module.exports.DIRECTIVE_SYMBOL = ':';
module.exports.DEFAULT_DIRECTIVE_PREFIX = 'd';
module.exports.EVENT_HANDLER_DIRECTIVE_PREFIX = 'bind';

