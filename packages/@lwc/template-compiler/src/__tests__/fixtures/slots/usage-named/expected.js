import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element(
      "section",
      {
        key: 3,
      },
      [
        api_slot(
          "test",
          {
            attrs: {
              name: "test",
            },
            key: 2,
          },
          [
            api_element(
              "p",
              {
                key: 1,
              },
              [api_text("Test slot content", 0)]
            ),
          ],
          $slotset
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = ["test"];
tmpl.stylesheets = [];
