import _implicitStylesheets from "./deep-data.css";
import _implicitScopedStylesheets from "./deep-data.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${3}></div><div${3}></div><div${"a6:data-name"}${3}></div><div${"s7"}${3}></div><div${"c8"}${2}></div></div></div><div${3}></div><div${3}></div><div${"a11:data-name"}${3}></div><div${"s12"}${3}></div><div${"c13"}${2}></div></div>`;
const stc0 = {
  ref: "foo",
};
const stc1 = {
  ref: "bar",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    ncls: api_normalize_class_name,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(4, stc0, null),
      api_static_part(
        5,
        {
          on:
            _m0 ||
            ($ctx._m0 = {
              click: api_bind($cmp.onClickBaz),
            }),
        },
        null
      ),
      api_static_part(
        6,
        {
          attrs: {
            "data-name": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(
        7,
        {
          style: $cmp.fooStyle,
        },
        null
      ),
      api_static_part(
        8,
        {
          className: api_normalize_class_name($cmp.fooClass),
        },
        null
      ),
      api_static_part(9, stc1, null),
      api_static_part(
        10,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.onClickQuux),
            }),
        },
        null
      ),
      api_static_part(
        11,
        {
          attrs: {
            "data-name": $cmp.bar,
          },
        },
        null
      ),
      api_static_part(
        12,
        {
          style: $cmp.barStyle,
        },
        null
      ),
      api_static_part(
        13,
        {
          className: api_normalize_class_name($cmp.barClass),
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-38lifoo63d4";
tmpl.legacyStylesheetToken = "x-deep-data_deep-data";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
