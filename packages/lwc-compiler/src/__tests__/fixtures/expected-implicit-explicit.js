import { registerTemplate, registerComponent, LightningElement } from 'lwc';
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return "h1" + shadowSelector + " {}\n";
}
var _implicitStylesheets = [stylesheet];
function tmpl($api, $cmp, $slotset, $ctx) {
return [];
}
var _tmpl = registerTemplate(tmpl);
const stylesheets = [_implicitStylesheets];
tmpl.stylesheets = stylesheets;
if (_implicitStylesheets) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
tmpl.stylesheetTokens = {
    hostAttribute: "x-explicit_like_implicit_explicit_like_implicit-host",
    shadowAttribute: "x-explicit_like_implicit_explicit_like_implicit"
};
class ExplicitStyles extends LightningElement {}
var explicit_like_implicit = registerComponent(ExplicitStyles, {
    tmpl: _tmpl
});
export default explicit_like_implicit;
