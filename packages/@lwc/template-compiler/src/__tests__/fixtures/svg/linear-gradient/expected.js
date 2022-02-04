import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    height: "150",
    width: "400",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  key: 1,
  svg: true,
};
const stc2 = {
  styleDecls: [
    ["stop-color", "rgb(255,255,0)", false],
    ["stop-opacity", "1", false],
  ],
  attrs: {
    offset: "0%",
  },
  key: 3,
  svg: true,
};
const stc3 = [];
const stc4 = {
  styleDecls: [
    ["stop-color", "rgb(255,0,0)", false],
    ["stop-opacity", "1", false],
  ],
  attrs: {
    offset: "100%",
  },
  key: 4,
  svg: true,
};
const stc5 = {
  attrs: {
    cx: "200",
    cy: "70",
    rx: "85",
    ry: "55",
    fill: "url(#grad1)",
  },
  key: 5,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("defs", stc1, [
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
          [api_element("stop", stc2, stc3), api_element("stop", stc4, stc3)]
        ),
      ]),
      api_element("ellipse", stc5, stc3),
    ]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
