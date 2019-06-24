import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element(
      "section",
      {
        key: 9
      },
      [
        api_element(
          "p",
          {
            key: 1
          },
          [api_text("Before header")]
        ),
        api_slot(
          "header",
          {
            attrs: {
              name: "header"
            },
            key: 2
          },
          [api_text("Default header")],
          $slotset
        ),
        api_element(
          "p",
          {
            key: 3
          },
          [api_text("In")]
        ),
        api_element(
          "p",
          {
            key: 4
          },
          [api_text("between")]
        ),
        api_slot(
          "",
          {
            key: 6
          },
          [
            api_element(
              "p",
              {
                key: 5
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
            key: 8
          },
          [
            api_element(
              "p",
              {
                key: 7
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
tmpl.stylesheets = [];
