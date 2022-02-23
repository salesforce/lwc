function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  var hostSelector = token ? ("." + token + "-host") : "";
  return [(useActualHostSelector ? ":host {color: red;}" : [hostSelector, " {color: red;}"].join('')), "div", shadowSelector, " {color: green;}"].join('');
  /*LWC compiler vX.X.X*/
}
stylesheet.$scoped$ = true;
export default [stylesheet];