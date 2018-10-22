import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      [
        api_element(
          "color-profile",
          {
            attrs: {
              local: "x"
            },
            key: 3,
            update: () => {}
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
