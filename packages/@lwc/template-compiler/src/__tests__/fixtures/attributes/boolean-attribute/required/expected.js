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
const stc1 = {
  attrs: {
    required: "",
  },
  props: {
    value: "empty string",
  },
  key: 1,
};
const stc2 = {
  attrs: {
    required: "other than true",
  },
  props: {
    value: "string value",
  },
  key: 2,
};
const stc3 = {
  value: "computed value",
};
const stc4 = {
  attrs: {
    required: "3",
  },
  props: {
    value: "integer value",
  },
  key: 4,
};
const stc5 = {
  props: {
    required: true,
  },
  key: 5,
};
const stc6 = {
  props: {
    required: "",
  },
  key: 6,
};
const stc7 = {
  props: {
    required: "other than true",
  },
  key: 7,
};
const stc8 = {
  props: {
    required: "3",
  },
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text, c: api_custom_element } = $api;
  return [
    api_element("input", stc0),
    api_element("input", stc1),
    api_element("input", stc2),
    api_element("input", {
      attrs: {
        required: $cmp.computed ? "" : null,
      },
      props: stc3,
      key: 3,
    }),
    api_element("input", stc4),
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
        key: 8,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc8, [api_text("integer value")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
