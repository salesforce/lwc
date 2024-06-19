import _implicitStylesheets from "./key-non-top-level.css";
import _implicitScopedStylesheets from "./key-non-top-level.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<tr${3}><td${3}>hello</td><td${3}>world</td><td${3}>!</td></tr>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element("table", stc0, [
      api_element(
        "tbody",
        stc1,
        api_iterator($cmp.rows, function (row) {
          return api_static_fragment($fragment1, api_key(3, row.id));
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7qgdv2kbdr9";
tmpl.legacyStylesheetToken = "x-key-non-top-level_key-non-top-level";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
