import { registerTemplate, renderApi } from "lwc";
const { gid: api_scoped_id, h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "stop",
  {
    styleDecls: [
      ["stop-color", "rgb(255,255,0)", false],
      ["stop-opacity", "1", false],
    ],
    attrs: {
      offset: "0%",
    },
    key: 3,
    svg: true,
  },
  []
);
const $hoisted2 = api_element(
  "stop",
  {
    styleDecls: [
      ["stop-color", "rgb(255,0,0)", false],
      ["stop-opacity", "1", false],
    ],
    attrs: {
      offset: "100%",
    },
    key: 4,
    svg: true,
  },
  []
);
const $hoisted3 = api_element(
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
);
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
function tmpl($api, $cmp, $slotset, $ctx) {
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
          [api_set_owner($hoisted1), api_set_owner($hoisted2)]
        ),
      ]),
      api_set_owner($hoisted3),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
