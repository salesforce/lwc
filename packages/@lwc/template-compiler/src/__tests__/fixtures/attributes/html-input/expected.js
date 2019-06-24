import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "input",
      {
        attrs: {
          type: "checkbox",
          minlength: "5",
          maxlength: "10"
        },
        props: {
          required: true,
          readOnly: true,
          checked: true
        },
        key: 1
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
