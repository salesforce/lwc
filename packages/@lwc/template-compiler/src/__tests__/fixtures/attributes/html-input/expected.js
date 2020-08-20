import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "input",
      {
        attrs: {
          type: "checkbox",
          required: "",
          readonly: "",
          minlength: "5",
          maxlength: "10",
        },
        props: {
          checked: true,
        },
        key: 0,
      },
      []
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
