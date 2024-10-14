import _implicitStylesheets from "./nested-if-loops.css";
import _implicitScopedStylesheets from "./nested-if-loops.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Inner</p>`;
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return $cmp.isTrue
    ? api_flatten([
        api_text("Outer"),
        api_iterator($cmp.items, function (item) {
          return api_static_fragment($fragment1, api_key(1, item.id));
        }),
      ])
    : stc0;
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6ugg4ao851r";
tmpl.legacyStylesheetToken = "x-nested-if-loops_nested-if-loops";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
