function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " h1", shadowSelector, ":before {content: '$test\"escaping quote(\\')'}", macroSelector, " h1", shadowSelector, ":after {content: \"$my test'escaping quote(\\\")\"}", macroSelector, " h2", shadowSelector, ":before {content: \"\\\\\\\\\"}", macroSelector, " h2", shadowSelector, ":after {content: \"`\"}"].join('');
}
export default [stylesheet];