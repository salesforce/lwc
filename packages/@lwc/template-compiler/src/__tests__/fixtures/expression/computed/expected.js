import _implicitStylesheets from "./computed.css";
import _implicitScopedStylesheets from "./computed.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_text(
      api_dynamic_text($cmp.val) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo]) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo][$cmp.state.bar])
    ),
    api_iterator($cmp.arr, function (item, index) {
      return api_text(
        api_dynamic_text($cmp.arr[index]) +
          " " +
          api_dynamic_text($cmp.arr[$cmp.state.val])
      );
    }),
  ]);
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5m7vih8u5bq";
tmpl.legacyStylesheetToken = "x-computed_computed";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
