import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        key: 6,
      },
      [
        api_element(
          "svg",
          {
            attrs: {
              width: "706",
              height: "180",
            },
            key: 5,
          },
          [
            api_element(
              "g",
              {
                attrs: {
                  transform: "translate(3,3)",
                },
                key: 4,
              },
              [
                api_element(
                  "g",
                  {
                    attrs: {
                      transform: "translate(250,0)",
                    },
                    key: 3,
                  },
                  [
                    api_element(
                      "foreignObject",
                      {
                        attrs: {
                          width: "200",
                          height: "36",
                          "xlink:href": "javascript:alert(1)",
                        },
                        key: 2,
                      },
                      [
                        api_element(
                          "a",
                          {
                            key: 1,
                          },
                          [api_text("x", 0)]
                        ),
                      ]
                    ),
                  ]
                ),
              ]
            ),
          ]
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
