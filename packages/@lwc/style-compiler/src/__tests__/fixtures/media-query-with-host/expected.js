function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@media screen and (max-width: 768px) {", (useActualHostSelector ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
}
export default [stylesheet];