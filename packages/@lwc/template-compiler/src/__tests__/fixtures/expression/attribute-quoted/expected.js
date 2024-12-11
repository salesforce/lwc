import _implicitStylesheets from "./attribute-quoted.css";
import _implicitScopedStylesheets from "./attribute-quoted.scoped.css?scoped=true";
import _xFoo from "x/foo";
import _xBar from "x/bar";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input${"a0:title"}${3}>`;
const $fragment2 = parseFragment`<input${"c0"}${2}>`;
const stc0 = {
  props: {
    bar: "{foo}",
  },
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    sp: api_static_part,
    st: api_static_fragment,
    ncls: api_normalize_class_name,
  } = $api;
  return [
    api_custom_element("x-foo", _xFoo, {
      props: {
        foo: $cmp.bar,
      },
      key: 0,
    }),
    api_static_fragment($fragment1, 2, [
      api_static_part(
        0,
        {
          attrs: {
            title: $cmp.adjacent,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 4, [
      api_static_part(
        0,
        {
          className: api_normalize_class_name($cmp.space),
        },
        null
      ),
    ]),
    api_custom_element("x-bar", _xBar, stc0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6n0ltrg1cd2";
tmpl.legacyStylesheetToken = "x-attribute-quoted_attribute-quoted";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
