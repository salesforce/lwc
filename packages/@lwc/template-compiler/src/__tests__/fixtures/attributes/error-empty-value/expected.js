import _implicitStylesheets from "./error-empty-value.css";
import _implicitScopedStylesheets from "./error-empty-value.scoped.css?scoped=true";
import _fooBar from "foo/bar";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p title=""${3}></p>`;
const stc0 = {
  props: {
    content: "",
    visible: true,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, c: api_custom_element } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_custom_element("foo-bar", _fooBar, stc0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5kto7mbkvvs";
tmpl.legacyStylesheetToken = "x-error-empty-value_error-empty-value";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
