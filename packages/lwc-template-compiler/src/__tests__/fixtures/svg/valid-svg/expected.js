import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "svg",
      {
        key: 24
      },
      [
        api_element(
          "a",
          {
            key: 1
          },
          []
        ),
        api_element(
          "circle",
          {
            key: 2
          },
          []
        ),
        api_element(
          "clipPath",
          {
            key: 3
          },
          []
        ),
        api_element(
          "defs",
          {
            key: 4
          },
          []
        ),
        api_element(
          "desc",
          {
            key: 5
          },
          []
        ),
        api_element(
          "ellipse",
          {
            key: 6
          },
          []
        ),
        api_element(
          "filter",
          {
            key: 7
          },
          []
        ),
        api_element(
          "g",
          {
            key: 8
          },
          []
        ),
        api_element(
          "line",
          {
            key: 9
          },
          []
        ),
        api_element(
          "marker",
          {
            key: 10
          },
          []
        ),
        api_element(
          "mask",
          {
            key: 11
          },
          []
        ),
        api_element(
          "path",
          {
            key: 12
          },
          []
        ),
        api_element(
          "pattern",
          {
            key: 13
          },
          []
        ),
        api_element(
          "polygon",
          {
            key: 14
          },
          []
        ),
        api_element(
          "polyline",
          {
            key: 15
          },
          []
        ),
        api_element(
          "rect",
          {
            key: 16
          },
          []
        ),
        api_element(
          "stop",
          {
            key: 17
          },
          []
        ),
        api_element(
          "symbol",
          {
            key: 18
          },
          []
        ),
        api_element(
          "text",
          {
            key: 19
          },
          []
        ),
        api_element(
          "textPath",
          {
            key: 20
          },
          []
        ),
        api_element(
          "title",
          {
            key: 21
          },
          []
        ),
        api_element(
          "tspan",
          {
            key: 22
          },
          []
        ),
        api_element(
          "use",
          {
            key: 23
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
