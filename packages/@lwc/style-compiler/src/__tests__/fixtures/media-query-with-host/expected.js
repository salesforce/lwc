function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@media screen and (max-width: 768px) {", (useActualHostSelector ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];