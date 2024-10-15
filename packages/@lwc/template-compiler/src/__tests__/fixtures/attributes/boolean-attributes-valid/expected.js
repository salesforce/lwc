import _implicitStylesheets from "./boolean-attributes-valid.css";
import _implicitScopedStylesheets from "./boolean-attributes-valid.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>x</p>`;
const $fragment2 = parseFragment`<input${"a0:readonly"} disabled title="foo"${3}>`;
const stc0 = {
  props: {
    autofocus: "true",
    autoplay: "true",
    capture: "true",
    checked: "true",
    disabled: "true",
    formnovalidate: "true",
    loop: "true",
    multiple: "true",
    muted: "true",
    noValidate: "true",
    open: "true",
    readOnly: "true",
    required: "true",
    reversed: "true",
    selected: "true",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    c: api_custom_element,
    sp: api_static_part,
  } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_custom_element("x-foo", _xFoo, stc0),
    api_static_fragment($fragment2, 4, [
      api_static_part(
        0,
        {
          attrs: {
            readonly: $cmp.getReadOnly ? "" : null,
          },
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3s2d8ffesnq";
tmpl.legacyStylesheetToken =
  "x-boolean-attributes-valid_boolean-attributes-valid";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
