import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      [
        api_slot(
          "test",
          {
            attrs: {
              name: "test"
            },
            key: 3,
            update: () => {}
          },
          [
            api_element(
              "p",
              {
                key: 4,
                create: () => {},
                update: () => {}
              },
              [api_text("Test slot content")]
            )
          ],
          $slotset
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = ["test"];
