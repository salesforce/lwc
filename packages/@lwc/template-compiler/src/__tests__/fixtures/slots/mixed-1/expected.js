import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element(
      "section",
      {
        key: 14,
      },
      [
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("Before header", 0)]
        ),
        api_slot(
          "header",
          {
            attrs: {
              name: "header",
            },
            key: 3,
          },
          [api_text("Default header", 2)],
          $slotset
        ),
        api_element(
          "p",
          {
            key: 5,
          },
          [api_text("In", 4)]
        ),
        api_element(
          "p",
          {
            key: 7,
          },
          [api_text("between", 6)]
        ),
        api_slot(
          "",
          {
            key: 10,
          },
          [
            api_element(
              "p",
              {
                key: 9,
              },
              [api_text("Default body", 8)]
            ),
          ],
          $slotset
        ),
        api_slot(
          "footer",
          {
            attrs: {
              name: "footer",
            },
            key: 13,
          },
          [
            api_element(
              "p",
              {
                key: 12,
              },
              [api_text("Default footer", 11)]
            ),
          ],
          $slotset
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.slots = ["header", "", "footer"];
tmpl.stylesheets = [];
