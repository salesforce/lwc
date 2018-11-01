import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "div",
      {
        context: {
          lwc: {
            dom: "manual"
          }
        },
        key: 2
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
