import _implicitStylesheets from "./computed-property.css";
import _implicitScopedStylesheets from "./computed-property.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}>${"t1"}</section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.bar.arr[$cmp.baz]),
            }),
        },
        null
      ),
      api_static_part(
        1,
        null,
        api_dynamic_text($cmp.bar.arr[$cmp.baz]) +
          " " +
          api_dynamic_text($cmp.bar.baz.arr[$cmp.quux]) +
          " " +
          api_dynamic_text($cmp.bar.arr[$cmp.baz.quux])
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-14g777mv3bo";
tmpl.legacyStylesheetToken = "x-computed-property_computed-property";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
