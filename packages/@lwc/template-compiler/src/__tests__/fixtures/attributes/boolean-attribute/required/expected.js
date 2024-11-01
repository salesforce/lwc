import _implicitStylesheets from "./required.css";
import _implicitScopedStylesheets from "./required.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input required${3}>`;
const $fragment2 = parseFragment`<input required${3}>`;
const $fragment3 = parseFragment`<input required="other than true"${3}>`;
const $fragment4 = parseFragment`<input${"a0:required"}${3}>`;
const $fragment5 = parseFragment`<input required="3"${3}>`;
const stc0 = {
  props: {
    value: "boolean present",
  },
};
const stc1 = {
  props: {
    value: "empty string",
  },
};
const stc2 = {
  props: {
    value: "string value",
  },
};
const stc3 = {
  value: "computed value",
};
const stc4 = {
  props: {
    value: "integer value",
  },
};
const stc5 = {
  props: {
    required: true,
  },
  key: 10,
};
const stc6 = {
  props: {
    required: "",
  },
  key: 11,
};
const stc7 = {
  props: {
    required: "other than true",
  },
  key: 12,
};
const stc8 = {
  props: {
    required: "3",
  },
  key: 14,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    sp: api_static_part,
    st: api_static_fragment,
    t: api_text,
    c: api_custom_element,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [api_static_part(0, stc0, null)]),
    api_static_fragment($fragment2, 3, [api_static_part(0, stc1, null)]),
    api_static_fragment($fragment3, 5, [api_static_part(0, stc2, null)]),
    api_static_fragment($fragment4, 7, [
      api_static_part(
        0,
        {
          props: stc3,
          attrs: {
            required: $cmp.computed ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment5, 9, [api_static_part(0, stc4, null)]),
    api_custom_element("x-foo", _xFoo, stc5, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc6, [api_text("empty string")]),
    api_custom_element("x-foo", _xFoo, stc7, [api_text("string value")]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: $cmp.computed,
        },
        key: 13,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc8, [api_text("integer value")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3ohsg11uo67";
tmpl.legacyStylesheetToken = "x-required_required";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
