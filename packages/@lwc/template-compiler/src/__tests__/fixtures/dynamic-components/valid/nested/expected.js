import _implicitStylesheets from "./nested.css";
import _implicitScopedStylesheets from "./nested.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>Inside the outer component</span>`;
const $fragment2 = parseFragment`<span${3}>Inside the nested component</span>`;
const stc0 = {
  "outer-style": true,
};
const stc1 = {
  myProp: "outer-prop",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    st: api_static_fragment,
    dc: api_dynamic_component,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_dynamic_component(
      $cmp.ctor1,
      {
        classMap: stc0,
        props: stc1,
        key: 0,
        on: ($ctx._m0 ||= {
          click: api_bind($cmp.handleOuterClick),
        }),
      },
      [
        api_static_fragment($fragment1, 2),
        api_dynamic_component(
          $cmp.ctor2,
          {
            classMap: stc0,
            props: stc1,
            key: 3,
            on: ($ctx._m1 ||= {
              click: api_bind($cmp.handleOuterClick),
            }),
          },
          [api_static_fragment($fragment2, 5)]
        ),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-ud1n1pkbjc";
tmpl.legacyStylesheetToken = "x-nested_nested";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
