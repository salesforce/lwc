import _implicitStylesheets from "./no-th-or-td.css";
import _implicitScopedStylesheets from "./no-th-or-td.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<tr${3}><th${3}></th></tr>`;
const $fragment2 = parseFragment`<tr${3}><td${3}></td></tr>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 4,
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
        "thead",
        stc1,
        api_iterator($cmp.rows, function (row) {
          return api_static_fragment($fragment1, api_key(3, row.id));
        })
      ),
      api_element(
        "tbody",
        stc2,
        api_iterator($cmp.rows, function (row) {
          return api_static_fragment($fragment2, api_key(6, row.id));
        })
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3dqe88fvse3";
tmpl.legacyStylesheetToken = "x-no-th-or-td_no-th-or-td";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
