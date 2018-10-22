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
        key: 2,
        update: () => {}
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
            key: 3,
            update: () => {}
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
            key: 4,
            update: () => {}
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
            key: 5,
            update: () => {}
          },
          [api_text("SVG")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
