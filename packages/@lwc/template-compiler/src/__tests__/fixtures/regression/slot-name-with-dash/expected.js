import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_slot(
      "secret-slot",
      {
        attrs: {
          name: "secret-slot"
        },
        key: 1
      },
      [
        api_element(
          "p",
          {
            key: 0
          },
          [api_text("Test slot content")]
        )
      ],
      $slotset
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = ["secret-slot"];
tmpl.stylesheets = [];
