import _implicitStylesheets from "./iterator.css";
import _implicitScopedStylesheets from "./iterator.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><a${3}>one</a></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    b: api_bind,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
  } = $api;
  const { _m0 } = $ctx;
  return api_iterator($cmp.bento, function (okazu) {
    return api_static_fragment($fragment1, api_key(1, okazu), [
      api_static_part(
        1,
        {
          on: ($ctx._m0 ||= {
            click: api_bind(() => $cmp.taberu(okazu)),
          }),
        },
        null
      ),
    ]);
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-34811vn79s2";
tmpl.legacyStylesheetToken = "x-iterator_iterator";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
