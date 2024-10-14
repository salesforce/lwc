import _implicitStylesheets from "./external-component.css";
import _implicitScopedStylesheets from "./external-component.scoped.css?scoped=true";
import _fooBar from "foo/bar";
import { freezeTemplate, registerTemplate, renderer } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("foo-bar", _fooBar, stc0),
    api_element("foo-bar", {
      key: 1,
      renderer: renderer,
      external: true,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5fjt5cr87l5";
tmpl.legacyStylesheetToken = "x-external-component_external-component";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
