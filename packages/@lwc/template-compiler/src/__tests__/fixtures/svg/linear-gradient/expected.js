import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, gid: api_scoped_id } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          height: "150",
          width: "400"
        },
        key: 5
      },
      [
        api_element(
          "defs",
          {
            key: 3
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
                  y2: "0%"
                },
                key: 2
              },
              [
                api_element(
                  "stop",
                  {
                    styleMap: {
                      stopColor: "rgb(255,255,0)",
                      stopOpacity: "1"
                    },
                    attrs: {
                      offset: "0%"
                    },
                    key: 0
                  },
                  []
                ),
                api_element(
                  "stop",
                  {
                    styleMap: {
                      stopColor: "rgb(255,0,0)",
                      stopOpacity: "1"
                    },
                    attrs: {
                      offset: "100%"
                    },
                    key: 1
                  },
                  []
                )
              ]
            )
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
              fill: "url(#grad1)"
            },
            key: 4
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
