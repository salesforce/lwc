function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "@keyframes slidein" + suffixToken + " {from {margin-left: 100%;}to {margin-left: 0%;}}div" + shadowSelector + " {color: var(--my-var);animation: 200ms slidein" + suffixToken + ";}span" + shadowSelector + " {animation: var(--another-var) slidein" + suffixToken + ";}p" + shadowSelector + " {animation-name: slidein" + suffixToken + ";animation-delay: 1s;}input" + shadowSelector + " {animation-name: spin;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];