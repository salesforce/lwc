import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "div",
  {
    key: 0,
    isStatic: true,
  },
  [
    api_element(
      "svg",
      {
        attrs: {
          width: "706",
          height: "180",
        },
        key: 1,
        svg: true,
        isStatic: true,
      },
      [
        api_element(
          "g",
          {
            attrs: {
              transform: "translate(3,3)",
            },
            key: 2,
            svg: true,
            isStatic: true,
          },
          [
            api_element(
              "g",
              {
                attrs: {
                  transform: "translate(250,0)",
                },
                key: 3,
                svg: true,
                isStatic: true,
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
                    key: 4,
                    svg: true,
                    isStatic: true,
                  },
                  [
                    api_element(
                      "a",
                      {
                        key: 5,
                        isStatic: true,
                      },
                      [api_text("x")]
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
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
