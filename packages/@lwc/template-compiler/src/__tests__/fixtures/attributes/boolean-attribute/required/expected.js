import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { computed: $cv0_0 } = $cmp;
  const { h: api_element, t: api_text, c: api_custom_element } = $api;
  return [
    api_element(
      "input",
      {
        attrs: {
          required: "",
        },
        props: {
          value: "boolean present",
        },
        key: 0,
      },
      []
    ),
    api_element(
      "input",
      {
        attrs: {
          required: "",
        },
        props: {
          value: "empty string",
        },
        key: 1,
      },
      []
    ),
    api_element(
      "input",
      {
        attrs: {
          required: "other than true",
        },
        props: {
          value: "string value",
        },
        key: 2,
      },
      []
    ),
    api_element(
      "input",
      {
        attrs: {
          required: $cv0_0 ? "" : null,
        },
        props: {
          value: "computed value",
        },
        key: 3,
      },
      []
    ),
    api_element(
      "input",
      {
        attrs: {
          required: "3",
        },
        props: {
          value: "integer value",
        },
        key: 4,
      },
      []
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: true,
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
          required: "",
        },
        key: 6,
      },
      [api_text("empty string")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: "other than true",
        },
        key: 7,
      },
      [api_text("string value")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: $cv0_0,
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
          required: "3",
        },
        key: 9,
      },
      [api_text("integer value")]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
