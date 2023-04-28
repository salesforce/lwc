function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "h1" + shadowSelector + ":before {content: '$test\"escaping quote(\\')'}h1" + shadowSelector + ":after {content: \"$my test'escaping quote(\\\")\"}h2" + shadowSelector + ":before {content: \"\\\\\\\\\"}h2" + shadowSelector + ":after {content: \"`\"}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];