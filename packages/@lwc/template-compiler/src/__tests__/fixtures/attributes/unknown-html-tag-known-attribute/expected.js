import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "somefancytag",
      {
        attrs: {
          min: "4"
        },
        key: 2
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
