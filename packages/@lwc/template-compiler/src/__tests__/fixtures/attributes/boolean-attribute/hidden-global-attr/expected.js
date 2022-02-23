import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    hidden: "",
  },
  key: 0,
};
const stc1 = {
  attrs: {
    hidden: "",
  },
  key: 1,
};
const stc2 = {
  attrs: {
    hidden: "other than true",
  },
  key: 2,
};
const stc3 = {
  attrs: {
    hidden: "3",
  },
  key: 4,
};
const stc4 = {
  props: {
    hidden: true,
  },
  key: 5,
};
const stc5 = {
  props: {
    hidden: true,
  },
  key: 6,
};
const stc6 = {
  props: {
    hidden: true,
  },
  key: 7,
};
const stc7 = {
  props: {
    hidden: true,
  },
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return [
    api_element("p", stc0, [api_text("boolean present")]),
    api_element("p", stc1, [api_text("empty string, should be true")]),
    api_element("p", stc2, [api_text("string value, should be true")]),
    api_element(
      "p",
      {
        attrs: {
          hidden: $cmp.computed ? "" : null,
        },
        key: 3,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_element("p", stc3, [api_text("integer value, should be true")]),
    api_custom_element("x-foo", _xFoo, stc4, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc5, [
      api_text("empty string, should be true"),
    ]),
    api_custom_element("x-foo", _xFoo, stc6, [
      api_text("string value, should be true"),
    ]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: $cmp.computed,
        },
        key: 8,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc7, [
      api_text("integer value, should be true"),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
