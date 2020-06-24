import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element(
      "section",
      {
        key: 5,
      },
      [
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("Sibling", 0)]
        ),
        api_slot(
          "",
          {
            key: 4,
          },
          [
            api_element(
              "p",
              {
                key: 3,
              },
              [api_text("Default slot content", 2)]
            ),
          ],
          $slotset
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
