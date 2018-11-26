function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "h1" + shadowSelector + ":before {content: '$test\"escaping quote(\\')'}\nh1" + shadowSelector + ":after {content: \"$my test'escaping quote(\\\")\"}\nh2" + shadowSelector + ":before {content: \"\\\\\\\\\"}\nh2" + shadowSelector + ":after {content: \"`\"}\n";
}
export default [stylesheet];