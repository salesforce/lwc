import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: "#yasaka-taxi"
        },
        key: 0
      },
      [api_text("Yasaka Taxi")]
    ),
    api_element(
      "map",
      {
        key: 3
      },
      [
        api_element(
          "area",
          {
            attrs: {
              href: "#eneos-gas"
            },
            key: 1
          },
          []
        ),
        api_element(
          "area",
          {
            attrs: {
              href: "#kawaramachi"
            },
            key: 2
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
