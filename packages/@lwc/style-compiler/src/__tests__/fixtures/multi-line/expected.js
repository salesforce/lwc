function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ((useActualHostSelector ? ":host(.selected) button" : hostSelector + ".selected button")) + shadowSelector + " {color: #0070d2;}" + ((useActualHostSelector ? ":host:not(.selected) button" : hostSelector + ":not(.selected) button")) + shadowSelector + " {color: #6d6d70;transition: all .2s ease-in-out;}" + ((useActualHostSelector ? ":host:not(.selected):hover button" + shadowSelector + ",:host button:focus" : hostSelector + ":not(.selected):hover button" + shadowSelector + "," + hostSelector + " button:focus")) + shadowSelector + " {color: #005fb2;transform: scale(1.2);}button:focus" + shadowSelector + " {outline: none;box-shadow: none;background-color: #f3f2f2;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];