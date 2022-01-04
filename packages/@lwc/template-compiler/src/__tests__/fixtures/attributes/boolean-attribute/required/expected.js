import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    required: "",
  },
  props: {
    value: "boolean present",
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  attrs: {
    required: "",
  },
  props: {
    value: "empty string",
  },
  key: 1,
};
const stc3 = {
  attrs: {
    required: "other than true",
  },
  props: {
    value: "string value",
  },
  key: 2,
};
const stc4 = {
  value: "computed value",
};
const stc5 = {
  attrs: {
    required: "3",
  },
  props: {
    value: "integer value",
  },
  key: 4,
};
const stc6 = {
  props: {
    required: true,
  },
  key: 5,
};
const stc7 = {
  props: {
    required: "",
  },
  key: 6,
};
const stc8 = {
  props: {
    required: "other than true",
  },
  key: 7,
};
const stc9 = {
  props: {
    required: "3",
  },
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text, c: api_custom_element } = $api;
  return [
    api_element("input", stc0, stc1),
    api_element("input", stc2, stc1),
    api_element("input", stc3, stc1),
    api_element(
      "input",
      {
        attrs: {
          required: $cmp.computed ? "" : null,
        },
        props: stc4,
        key: 3,
      },
      stc1
    ),
    api_element("input", stc5, stc1),
    api_custom_element("x-foo", _xFoo, stc6, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc7, [api_text("empty string")]),
    api_custom_element("x-foo", _xFoo, stc8, [api_text("string value")]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: $cmp.computed,
        },
        key: 8,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc9, [api_text("integer value")]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
