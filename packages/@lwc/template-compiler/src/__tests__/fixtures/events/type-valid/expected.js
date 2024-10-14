import _implicitStylesheets from "./type-valid.css";
import _implicitScopedStylesheets from "./type-valid.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Click</div>`;
const $fragment2 = parseFragment`<div${3}>Click</div>`;
const $fragment3 = parseFragment`<div${3}>Click</div>`;
const $fragment4 = parseFragment`<div${3}>Click</div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1, _m2, _m3, _m4, _m5, _m6, _m7 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              a123: api_bind($cmp.handleClick),
            }),
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        0,
        {
          on:
            _m3 ||
            ($ctx._m3 = {
              foo_bar: api_bind($cmp.handleClick),
            }),
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 5, [
      api_static_part(
        0,
        {
          on:
            _m5 ||
            ($ctx._m5 = {
              foo_: api_bind($cmp.handleClick),
            }),
        },
        null
      ),
    ]),
    api_static_fragment($fragment4, 7, [
      api_static_part(
        0,
        {
          on:
            _m7 ||
            ($ctx._m7 = {
              a123: api_bind($cmp.handleClick),
            }),
        },
        null
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-56j34l79noq";
tmpl.legacyStylesheetToken = "x-type-valid_type-valid";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
