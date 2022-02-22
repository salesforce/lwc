function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [(useActualHostSelector ? [":host(.selected) button", shadowSelector, " {color: #0070d2;}"].join('') : [hostSelector, ".selected button", shadowSelector, " {color: #0070d2;}"].join('')), (useActualHostSelector ? [":host:not(.selected) button", shadowSelector, " {color: #6d6d70;transition: all .2s ease-in-out;}"].join('') : [hostSelector, ":not(.selected) button", shadowSelector, " {color: #6d6d70;transition: all .2s ease-in-out;}"].join('')), (useActualHostSelector ? [":host:not(.selected):hover button", shadowSelector, ",:host button:focus", shadowSelector, " {color: #005fb2;transform: scale(1.2);}"].join('') : [hostSelector, ":not(.selected):hover button", shadowSelector, ",", hostSelector, " button:focus", shadowSelector, " {color: #005fb2;transform: scale(1.2);}"].join('')), "button:focus", shadowSelector, " {outline: none;box-shadow: none;background-color: #f3f2f2;}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];