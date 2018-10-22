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
        api_element(
          "p",
          {
            key: 3,
            create: () => {},
            update: () => {}
          },
          [api_text("Before header")]
        ),
        api_slot(
          "header",
          {
            attrs: {
              name: "header"
            },
            key: 4,
            update: () => {}
          },
          [api_text("Default header")],
          $slotset
        ),
        api_element(
          "p",
          {
            key: 5,
            create: () => {},
            update: () => {}
          },
          [api_text("In")]
        ),
        api_element(
          "p",
          {
            key: 6,
            create: () => {},
            update: () => {}
          },
          [api_text("between")]
        ),
        api_slot(
          "",
          {
            key: 7,
            create: () => {},
            update: () => {}
          },
          [
            api_element(
              "p",
              {
                key: 8,
                create: () => {},
                update: () => {}
              },
              [api_text("Default body")]
            )
          ],
          $slotset
        ),
        api_slot(
          "footer",
          {
            attrs: {
              name: "footer"
            },
            key: 9,
            update: () => {}
          },
          [
            api_element(
              "p",
              {
                key: 10,
                create: () => {},
                update: () => {}
              },
              [api_text("Default footer")]
            )
          ],
          $slotset
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = ["header", "", "footer"];
