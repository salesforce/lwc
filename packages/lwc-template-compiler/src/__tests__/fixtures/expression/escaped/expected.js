import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "input",
      {
        props: {
          value: "{value}"
        },
        key: 2,
        update: () => {}
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
