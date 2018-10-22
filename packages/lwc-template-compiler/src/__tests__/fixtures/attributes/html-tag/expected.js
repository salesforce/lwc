import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;

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
          "p",
          {
            attrs: {
              title: "x",
              "aria-hidden": "x"
            },
            key: 3,
            update: () => {}
          },
          [api_text("x")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
