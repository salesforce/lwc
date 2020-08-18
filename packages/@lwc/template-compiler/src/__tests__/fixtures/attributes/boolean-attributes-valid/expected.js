import _xFoo from "x/foo";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
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
      [api_text("x")]
    ),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
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
        key: 1,
      },
      []
    ),
    api_element(
      "input",
      {
        attrs: {
          readonly: $cmp.getReadOnly ? "" : null,
          disabled: "",
          title: "foo",
        },
        key: 2,
      },
      []
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
