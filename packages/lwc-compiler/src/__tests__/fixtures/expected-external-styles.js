import stylesheet0 from '@salesforce/designSystem/index.css';
import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
return ``;
}
var _implicitStylesheets = [stylesheet0, stylesheet];
function tmpl($api, $cmp, $slotset, $ctx) {
return [];
}
var _tmpl = registerTemplate(tmpl);
if (_implicitStylesheets) {
tmpl.stylesheets ? tmpl.stylesheets.push(_implicitStylesheets) : tmpl.stylesheets = [_implicitStylesheets];
}
tmpl.stylesheetTokens = {
hostAttribute: "x-external_style_external_style-host",
shadowAttribute: "x-external_style_external_style"
};
class Foo extends LightningElement {}
var external_style = registerComponent(Foo, {
tmpl: _tmpl
});
export default external_style;
