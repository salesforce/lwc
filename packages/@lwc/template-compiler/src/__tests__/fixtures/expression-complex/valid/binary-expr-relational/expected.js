import _implicitStylesheets from "./binary-expr-relational.css";
import _implicitScopedStylesheets from "./binary-expr-relational.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>{valid expression}</span>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, stc1, [
        api_text("start" + "start{functionCallend"),
        api_static_fragment($fragment1, 3),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-39eucbo25ji";
tmpl.legacyStylesheetToken = "x-binary-expr-relational_binary-expr-relational";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
