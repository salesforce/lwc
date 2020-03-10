import _xFoo from 'x/foo';
import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
return ["\n", (nativeShadow ? ":host {color: blue;}" : [hostSelector, " {color: blue;}"].join('')), "\ndiv", shadowSelector, " {color: red;}\nx-foo", shadowSelector, " {color: green;}\n"].join('');
}
var _implicitStylesheets = [stylesheet];
function tmpl($api, $cmp, $slotset, $ctx) {
const {
h: api_element,
c: api_custom_element
} = $api;
return [api_element("div", {
key: 0
}, []), api_custom_element("x-foo", _xFoo, {
key: 1
}, [])];
}
var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
if (_implicitStylesheets) {
tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
tmpl.stylesheetTokens = {
hostAttribute: "x-styled_styled-host",
shadowAttribute: "x-styled_styled"
};
class Styled extends LightningElement {}
var styled = registerComponent(Styled, {
tmpl: _tmpl
});
export default styled;
