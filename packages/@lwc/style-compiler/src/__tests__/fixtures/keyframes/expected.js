function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "@keyframes slidein" + suffixToken + " {from {margin-left: 100%;}to {margin-left: 0%;}}div" + shadowSelector + " {animation: 3s ease-in 1s 2 reverse both paused slidein" + suffixToken + ";}span" + shadowSelector + " {-webkit-animation: 3s ease-in 1s 2 reverse both paused slidein" + suffixToken + ";-moz-animation: 3s ease-in 1s 2 reverse both paused slidein" + suffixToken + ";animation: slidein" + suffixToken + " 3s;}button" + shadowSelector + " {animation: spin 1s;}p" + shadowSelector + " {-webkit-animation-name: slidein" + suffixToken + ";-moz-animation-name: slidein" + suffixToken + ";animation-name: slidein" + suffixToken + ";-webkit-animation-delay: 1s;-moz-animation-delay: 1s;animation-delay: 1s;}input" + shadowSelector + " {animation-name: spin;}form" + shadowSelector + " {animation: 2s linear 1s reverse slidein" + suffixToken + "}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];