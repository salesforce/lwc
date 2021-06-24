function stylesheet() {
  var hostSelector = ".foo-host";
  var shadowSelector = ".foo";
  var nativeShadow = false;
  return [(nativeShadow ? ":host {color: red;}" : [hostSelector, " {color: red;}"].join('')), "div", shadowSelector, " {color: green;}"].join('');
}
stylesheet.$scoped$ = true;
export default [stylesheet];