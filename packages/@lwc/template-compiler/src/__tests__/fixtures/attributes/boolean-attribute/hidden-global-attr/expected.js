import _xFoo from "x/foo";
import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, c: api_custom_element } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    attrs: {
      hidden: "",
    },
    key: 0,
  },
  [api_text("boolean present")],
  true
);
const $hoisted2 = api_element(
  "p",
  {
    attrs: {
      hidden: "",
    },
    key: 1,
  },
  [api_text("empty string, should be true")],
  true
);
const $hoisted3 = api_element(
  "p",
  {
    attrs: {
      hidden: "other than true",
    },
    key: 2,
  },
  [api_text("string value, should be true")],
  true
);
const $hoisted4 = api_element(
  "p",
  {
    attrs: {
      hidden: "3",
    },
    key: 4,
  },
  [api_text("integer value, should be true")],
  true
);
const stc0 = {
  props: {
    hidden: true,
  },
  key: 5,
};
const stc1 = {
  props: {
    hidden: true,
  },
  key: 6,
};
const stc2 = {
  props: {
    hidden: true,
  },
  key: 7,
};
const stc3 = {
  props: {
    hidden: true,
  },
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    $hoisted1,
    $hoisted2,
    $hoisted3,
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
    $hoisted4,
    api_custom_element("x-foo", _xFoo, stc0, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc1, [
      api_text("empty string, should be true"),
    ]),
    api_custom_element("x-foo", _xFoo, stc2, [
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
    api_custom_element("x-foo", _xFoo, stc3, [
      api_text("integer value, should be true"),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
