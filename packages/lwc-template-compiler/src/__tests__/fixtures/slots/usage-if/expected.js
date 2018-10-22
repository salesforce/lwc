import _nsCmp from "ns/cmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      [
        api_custom_element(
          "ns-cmp",
          _nsCmp,
          {
            key: 3,
            create: () => {},
            update: () => {}
          },
          [
            $cmp.isTrue
              ? api_element(
                  "p",
                  {
                    attrs: {
                      slot: true
                    },
                    key: 5
                  },
                  [api_text("S1")]
                )
              : null,
            api_element(
              "p",
              {
                attrs: {
                  slot: true
                },
                key: 6
              },
              [api_text("S2")]
            )
          ]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
