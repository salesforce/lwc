import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 1
      },
      [
        api_element(
          "color-profile",
          {
            attrs: {
              local: "x"
            },
            key: 0
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
