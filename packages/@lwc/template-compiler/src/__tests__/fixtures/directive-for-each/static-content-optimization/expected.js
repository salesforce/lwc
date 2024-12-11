import _implicitStylesheets from "./static-content-optimization.css";
import _implicitScopedStylesheets from "./static-content-optimization.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${"a1:data-dynamic"}${3}></span><span data-static="bar"${3}></span><span${"s3"}${3}></span><span${3}></span><span style="background: red;"${3}></span><span${3}>${"t7"}</span><span${"a8:data-dynamic"}${"s8"}${"c8"}${2}>${"t9"}</span></div>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    ncls: api_normalize_class_name,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "div",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_static_fragment($fragment1, api_key(2, item.key), [
          api_static_part(
            1,
            {
              attrs: {
                "data-dynamic": $cmp.foo,
              },
            },
            null
          ),
          api_static_part(
            3,
            {
              style: $cmp.baaz,
            },
            null
          ),
          api_static_part(
            7,
            null,
            "concatenated text " + api_dynamic_text(item.text)
          ),
          api_static_part(
            8,
            {
              style: $cmp.baaz,
              className: api_normalize_class_name($cmp.bar),
              attrs: {
                "data-dynamic": $cmp.foo,
              },
            },
            null
          ),
          api_static_part(9, null, api_dynamic_text(item.text)),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-40fo8n330sd";
tmpl.legacyStylesheetToken =
  "x-static-content-optimization_static-content-optimization";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
