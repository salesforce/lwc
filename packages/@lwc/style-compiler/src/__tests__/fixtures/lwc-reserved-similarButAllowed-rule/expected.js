function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "[turkey='val']" + shadowSelector + " {}[keyboard='val']" + shadowSelector + " {}[notif\\:true='val']" + shadowSelector + " {}[notfor\\:item='val']" + shadowSelector + " {}[notfor\\:each='val']" + shadowSelector + " {}[notiterator\\:name='val']" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];