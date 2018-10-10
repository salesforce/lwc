import _nsCmp from "ns/cmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;

  return [
    api_element(
      "section",
      {
        key: 2
      },
      [
        api_custom_element(
          "ns-cmp",
          _nsCmp,
          {
            key: 3
          },
          [
            api_element(
              "p",
              {
                attrs: {
                  slot: "header"
                },
                key: 4
              },
              [api_text("Header Slot Content")]
            ),
            api_element(
              "p",
              {
                attrs: {
                  slot: true
                },
                key: 5
              },
              [api_text("Default Content")]
            )
          ]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
