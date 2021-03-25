import _xFoo from 'x/foo';
import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
return [(transformHost ? [hostSelector, " {color: blue;}"].join('') : ":host {color: blue;}"), macroSelector, " div", shadowSelector, " {color: red;}", macroSelector, " x-foo", shadowSelector, " {color: green;}"].join('');
}
var _implicitStylesheets = [stylesheet];
function tmpl($api, $cmp, $slotset, $ctx) {
const {h: api_element, c: api_custom_element} = $api;
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
