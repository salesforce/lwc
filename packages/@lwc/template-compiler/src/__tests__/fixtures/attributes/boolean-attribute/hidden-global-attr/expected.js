import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { computed: $cv0_0 } = $cmp;
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return [
    api_element(
      "p",
      {
        attrs: {
          hidden: "",
        },
        key: 0,
      },
      [api_text("boolean present")]
    ),
    api_element(
      "p",
      {
        attrs: {
          hidden: "",
        },
        key: 1,
      },
      [api_text("empty string, should be true")]
    ),
    api_element(
      "p",
      {
        attrs: {
          hidden: "other than true",
        },
        key: 2,
      },
      [api_text("string value, should be true")]
    ),
    api_element(
      "p",
      {
        attrs: {
          hidden: $cv0_0 ? "" : null,
        },
        key: 3,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_element(
      "p",
      {
        attrs: {
          hidden: "3",
        },
        key: 4,
      },
      [api_text("integer value, should be true")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: true,
        },
        key: 5,
      },
      [api_text("boolean present")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: true,
        },
        key: 6,
      },
      [api_text("empty string, should be true")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: true,
        },
        key: 7,
      },
      [api_text("string value, should be true")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: $cv0_0,
        },
        key: 8,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: true,
        },
        key: 9,
      },
      [api_text("integer value, should be true")]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
