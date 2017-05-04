function extractRaw(src, location) {
    const { startOffset, endOffset } = location;
    return src.slice(startOffset, endOffset);
}

function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

module.exports = {
    extractRaw,
    makeMap,
}
