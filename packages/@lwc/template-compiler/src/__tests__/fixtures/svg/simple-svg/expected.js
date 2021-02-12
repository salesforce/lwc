import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          version: "1.1",
          baseProfile: "full",
          width: "300",
          height: "200",
          xmlns: "http://www.w3.org/2000/svg"
        },
        key: 0
      },
      [
        api_element(
          "rect",
          {
            attrs: {
              width: "100%",
              height: "100%",
              fill: "red"
            },
            key: 1
          },
          []
        ),
        api_element(
          "circle",
          {
            attrs: {
              cx: "150",
              cy: "100",
              r: "80",
              fill: "green"
            },
            key: 2
          },
          []
        ),
        api_element(
          "text",
          {
            attrs: {
              x: "150",
              y: "125",
              "font-size": "60",
              "text-anchor": "middle",
              fill: "white"
            },
            key: 3
          },
          [api_text("SVG")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
