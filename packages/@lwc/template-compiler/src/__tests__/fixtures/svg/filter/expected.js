import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element, t: api_text } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          width: "400",
          height: "400",
          xmlns: "http://www.w3.org/2000/svg"
        },
        key: 0
      },
      [
        api_element(
          "defs",
          {
            key: 1
          },
          [
            api_element(
              "filter",
              {
                attrs: {
                  id: api_scoped_id("flood"),
                  x: "0",
                  y: "0",
                  width: "100%",
                  height: "100%",
                  primitiveUnits: "objectBoundingBox"
                },
                key: 2
              },
              [
                api_element(
                  "feFlood",
                  {
                    attrs: {
                      x: "25%",
                      y: "25%",
                      width: "50%",
                      height: "50%",
                      "flood-color": "green",
                      "flood-opacity": "0.75"
                    },
                    key: 3
                  },
                  []
                )
              ]
            ),
            api_element(
              "filter",
              {
                attrs: {
                  id: api_scoped_id("blend"),
                  primitiveUnits: "objectBoundingBox"
                },
                key: 4
              },
              [
                api_element(
                  "feBlend",
                  {
                    attrs: {
                      x: "25%",
                      y: "25%",
                      width: "50%",
                      height: "50%",
                      in2: "SourceGraphic",
                      mode: "multiply"
                    },
                    key: 5
                  },
                  []
                )
              ]
            ),
            api_element(
              "filter",
              {
                attrs: {
                  id: api_scoped_id("merge"),
                  primitiveUnits: "objectBoundingBox"
                },
                key: 6
              },
              [
                api_element(
                  "feMerge",
                  {
                    attrs: {
                      x: "25%",
                      y: "25%",
                      width: "50%",
                      height: "50%"
                    },
                    key: 7
                  },
                  [
                    api_element(
                      "feMergeNode",
                      {
                        attrs: {
                          in: "SourceGraphic"
                        },
                        key: 8
                      },
                      []
                    ),
                    api_element(
                      "feMergeNode",
                      {
                        attrs: {
                          in: "FillPaint"
                        },
                        key: 9
                      },
                      []
                    )
                  ]
                )
              ]
            )
          ]
        ),
        api_element(
          "g",
          {
            attrs: {
              fill: "none",
              stroke: "blue",
              "stroke-width": "4"
            },
            key: 10
          },
          [
            api_element(
              "rect",
              {
                attrs: {
                  width: "200",
                  height: "200"
                },
                key: 11
              },
              []
            ),
            api_element(
              "line",
              {
                attrs: {
                  x2: "200",
                  y2: "200"
                },
                key: 12
              },
              []
            ),
            api_element(
              "line",
              {
                attrs: {
                  x1: "200",
                  y2: "200"
                },
                key: 13
              },
              []
            )
          ]
        ),
        api_element(
          "circle",
          {
            attrs: {
              fill: "green",
              filter: "url(#flood)",
              cx: "100",
              cy: "100",
              r: "90"
            },
            key: 14
          },
          []
        ),
        api_element(
          "g",
          {
            attrs: {
              transform: "translate(200 0)"
            },
            key: 15
          },
          [
            api_element(
              "g",
              {
                attrs: {
                  fill: "none",
                  stroke: "blue",
                  "stroke-width": "4"
                },
                key: 16
              },
              [
                api_element(
                  "rect",
                  {
                    attrs: {
                      width: "200",
                      height: "200"
                    },
                    key: 17
                  },
                  []
                ),
                api_element(
                  "line",
                  {
                    attrs: {
                      x2: "200",
                      y2: "200"
                    },
                    key: 18
                  },
                  []
                ),
                api_element(
                  "line",
                  {
                    attrs: {
                      x1: "200",
                      y2: "200"
                    },
                    key: 19
                  },
                  []
                )
              ]
            ),
            api_element(
              "circle",
              {
                attrs: {
                  fill: "green",
                  filter: "url(#blend)",
                  cx: "100",
                  cy: "100",
                  r: "90"
                },
                key: 20
              },
              []
            )
          ]
        ),
        api_element(
          "g",
          {
            attrs: {
              transform: "translate(0 200)"
            },
            key: 21
          },
          [
            api_element(
              "g",
              {
                attrs: {
                  fill: "none",
                  stroke: "blue",
                  "stroke-width": "4"
                },
                key: 22
              },
              [
                api_element(
                  "rect",
                  {
                    attrs: {
                      width: "200",
                      height: "200"
                    },
                    key: 23
                  },
                  []
                ),
                api_element(
                  "line",
                  {
                    attrs: {
                      x2: "200",
                      y2: "200"
                    },
                    key: 24
                  },
                  []
                ),
                api_element(
                  "line",
                  {
                    attrs: {
                      x1: "200",
                      y2: "200"
                    },
                    key: 25
                  },
                  []
                )
              ]
            ),
            api_element(
              "circle",
              {
                attrs: {
                  fill: "green",
                  "fill-opacity": "0.5",
                  filter: "url(#merge)",
                  cx: "100",
                  cy: "100",
                  r: "90"
                },
                key: 26
              },
              []
            )
          ]
        )
      ]
    ),
    api_element(
      "svg",
      {
        attrs: {
          width: "600",
          height: "250",
          viewBox: "0 0 600 250",
          xmlns: "http://www.w3.org/2000/svg",
          "xmlns:xlink": "http://www.w3.org/1999/xlink"
        },
        key: 27
      },
      [
        api_element(
          "rect",
          {
            attrs: {
              fill: "none",
              stroke: "blue",
              x: "1",
              y: "1",
              width: "598",
              height: "248"
            },
            key: 28
          },
          []
        ),
        api_element(
          "g",
          {
            key: 29
          },
          [
            api_element(
              "rect",
              {
                attrs: {
                  x: "50",
                  y: "25",
                  width: "100",
                  height: "200",
                  filter: "url(#Default)"
                },
                key: 30
              },
              []
            ),
            api_element(
              "rect",
              {
                attrs: {
                  x: "50",
                  y: "25",
                  width: "100",
                  height: "200",
                  fill: "none",
                  stroke: "green"
                },
                key: 31
              },
              []
            ),
            api_element(
              "rect",
              {
                attrs: {
                  x: "250",
                  y: "25",
                  width: "100",
                  height: "200",
                  filter: "url(#Fitted)"
                },
                key: 32
              },
              []
            ),
            api_element(
              "rect",
              {
                attrs: {
                  x: "250",
                  y: "25",
                  width: "100",
                  height: "200",
                  fill: "none",
                  stroke: "green"
                },
                key: 33
              },
              []
            ),
            api_element(
              "rect",
              {
                attrs: {
                  x: "450",
                  y: "25",
                  width: "100",
                  height: "200",
                  filter: "url(#Shifted)"
                },
                key: 34
              },
              []
            ),
            api_element(
              "rect",
              {
                attrs: {
                  x: "450",
                  y: "25",
                  width: "100",
                  height: "200",
                  fill: "none",
                  stroke: "green"
                },
                key: 35
              },
              []
            )
          ]
        ),
        api_element(
          "filter",
          {
            attrs: {
              id: api_scoped_id("MyFilter"),
              filterUnits: "userSpaceOnUse",
              x: "0",
              y: "0",
              width: "200",
              height: "120"
            },
            key: 36
          },
          [
            api_element(
              "desc",
              {
                key: 37
              },
              [api_text("Produces a 3D lighting effect.")]
            ),
            api_element(
              "feGaussianBlur",
              {
                attrs: {
                  in: "SourceAlpha",
                  stdDeviation: "4",
                  result: "blur"
                },
                key: 38
              },
              []
            ),
            api_element(
              "feOffset",
              {
                attrs: {
                  in: "blur",
                  dx: "4",
                  dy: "4",
                  result: "offsetBlur"
                },
                key: 39
              },
              []
            ),
            api_element(
              "feSpecularLighting",
              {
                attrs: {
                  in: "blur",
                  surfaceScale: "5",
                  specularConstant: ".75",
                  specularExponent: "20",
                  "lighting-color": "#bbbbbb",
                  result: "specOut"
                },
                key: 40
              },
              [
                api_element(
                  "fePointLight",
                  {
                    attrs: {
                      x: "-5000",
                      y: "-10000",
                      z: "20000"
                    },
                    key: 41
                  },
                  []
                )
              ]
            ),
            api_element(
              "feComposite",
              {
                attrs: {
                  in: "specOut",
                  in2: "SourceAlpha",
                  operator: "in",
                  result: "specOut"
                },
                key: 42
              },
              []
            ),
            api_element(
              "feComposite",
              {
                attrs: {
                  in: "SourceGraphic",
                  in2: "specOut",
                  operator: "arithmetic",
                  k1: "0",
                  k2: "1",
                  k3: "1",
                  k4: "0",
                  result: "litPaint"
                },
                key: 43
              },
              []
            ),
            api_element(
              "feMerge",
              {
                key: 44
              },
              [
                api_element(
                  "feMergeNode",
                  {
                    attrs: {
                      in: "offsetBlur"
                    },
                    key: 45
                  },
                  []
                ),
                api_element(
                  "feMergeNode",
                  {
                    attrs: {
                      in: "litPaint"
                    },
                    key: 46
                  },
                  []
                )
              ]
            )
          ]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
