import _implicitStylesheets from "./tag.css";
import _implicitScopedStylesheets from "./tag.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><div${3}>x</div><div${3}>x</div></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          on:
            $ctx._m1 ||
            ($ctx._m1 = {
              click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
            }),
        },
        null
      ),
      api_static_part(
        3,
        {
          on:
            $ctx._m3 ||
            ($ctx._m3 = {
              press: _m2 || ($ctx._m2 = api_bind($cmp.handlePress)),
            }),
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7v5hvorhnq1";
tmpl.legacyStylesheetToken = "x-tag_tag";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
