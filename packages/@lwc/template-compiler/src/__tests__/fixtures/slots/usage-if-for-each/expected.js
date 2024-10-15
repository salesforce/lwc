import _implicitStylesheets from "./usage-if-for-each.css";
import _implicitScopedStylesheets from "./usage-if-for-each.scoped.css?scoped=true";
import _aB from "a/b";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>X</p>`;
const stc0 = {
  classMap: {
    s2: true,
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "a-b",
      _aB,
      stc0,
      $cmp.isTrue
        ? api_iterator($cmp.items, function (item) {
            return api_static_fragment($fragment1, api_key(2, item.id));
          })
        : stc1
    ),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5m49nb9vba";
tmpl.legacyStylesheetToken = "x-usage-if-for-each_usage-if-for-each";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
