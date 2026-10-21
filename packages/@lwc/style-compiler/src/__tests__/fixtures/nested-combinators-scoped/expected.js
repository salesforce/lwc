function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  var hostSelector = token ? ("." + token + "-host") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {> h2" + shadowSelector + " {color: red;}> .child" + shadowSelector + ", > h3" + shadowSelector + " {color: green;}+ p" + shadowSelector + " {color: blue;}~ span" + shadowSelector + " {margin-left: 5px;}> " + shadowSelector + "::before {content: 'before';}&" + shadowSelector + " > a" + shadowSelector + " {color: purple;}}";
  /*LWC compiler vX.X.X*/
}
stylesheet.$scoped$ = true;
export default [stylesheet];