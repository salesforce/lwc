import _nsCmp from "ns/cmp";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        api_custom_element(
          "ns-cmp",
          _nsCmp,
          {
            key: 1,
          },
          [
            $cmp.isTrue
              ? api_element(
                  "p",
                  {
                    attrs: {
                      slot: "",
                    },
                    key: 2,
                  },
                  [api_text("S1")]
                )
              : null,
            api_element(
              "p",
              {
                attrs: {
                  slot: "",
                },
                key: 3,
              },
              [api_text("S2")]
            ),
          ]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
