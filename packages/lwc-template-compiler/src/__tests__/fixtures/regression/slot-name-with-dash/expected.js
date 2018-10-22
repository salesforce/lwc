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
        key: 2,
        update: () => {}
      },
      [
        api_element(
          "p",
          {
            key: 3,
            create: () => {},
            update: () => {}
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
