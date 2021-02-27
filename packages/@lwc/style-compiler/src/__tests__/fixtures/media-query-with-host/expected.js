function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["@media screen and (max-width: 768px) {", (nativeShadow ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
}
export default [stylesheet];