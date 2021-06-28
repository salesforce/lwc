import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          height: "150",
          width: "400",
        },
        key: 0,
        svg: true,
      },
      [
        api_element(
          "defs",
          {
            key: 1,
            svg: true,
          },
          [
            api_element(
              "linearGradient",
              {
                attrs: {
                  id: api_scoped_id("grad1"),
                  x1: "0%",
                  y1: "0%",
                  x2: "100%",
                  y2: "0%",
                },
                key: 2,
                svg: true,
              },
              [
                api_element(
                  "stop",
                  {
                    styleMap: {
                      "stop-color": "rgb(255,255,0)",
                      "stop-opacity": "1",
                    },
                    attrs: {
                      offset: "0%",
                    },
                    key: 3,
                    svg: true,
                  },
                  []
                ),
                api_element(
                  "stop",
                  {
                    styleMap: {
                      "stop-color": "rgb(255,0,0)",
                      "stop-opacity": "1",
                    },
                    attrs: {
                      offset: "100%",
                    },
                    key: 4,
                    svg: true,
                  },
                  []
                ),
              ]
            ),
          ]
        ),
        api_element(
          "ellipse",
          {
            attrs: {
              cx: "200",
              cy: "70",
              rx: "85",
              ry: "55",
              fill: "url(#grad1)",
            },
            key: 5,
            svg: true,
          },
          []
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
