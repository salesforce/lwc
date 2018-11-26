import { registerTemplate, registerComponent, LightningElement } from 'lwc';
import stylesheet0 from '@salesforce/designSystem/index.css';
function tmpl($api, $cmp, $slotset, $ctx) {
    return [];
}
var _tmpl = registerTemplate(tmpl);
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return "h1" + shadowSelector + " {}\n";
}
const stylesheets = [stylesheet0, stylesheet];
tmpl.stylesheets = stylesheets;
tmpl.stylesheetTokens = {
    hostAttribute: "x-inline_style_inline_style-host",
    shadowAttribute: "x-inline_style_inline_style"
};
class Foo extends LightningElement {}
var inline_style = registerComponent(Foo, {
tmpl: _tmpl
});
export default inline_style;
