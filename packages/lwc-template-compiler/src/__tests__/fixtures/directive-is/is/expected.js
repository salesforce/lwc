import _nsRow from "ns/row";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;

  return [
    api_element(
      "table",
      {
        key: 2
      },
      [
        api_element(
          "tbody",
          {
            key: 3
          },
          [
            api_custom_element(
              "tr",
              _nsRow,
              {
                attrs: {
                  is: "ns-row"
                },
                key: 4
              },
              []
            )
          ]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
