function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return ["@media screen and (max-width: 768px) {", (transformHost ? [hostSelector, " {width: calc(50% - 1rem);}"].join('') : ":host {width: calc(50% - 1rem);}"), "}"].join('');
}
export default [stylesheet];