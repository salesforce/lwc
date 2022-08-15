import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1"${3}/>`;
const $fragment2 = parseSVGFragment`<stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1"${3}/>`;
const $fragment3 = parseSVGFragment`<ellipse cx="200" cy="70" rx="85" ry="55" fill="url(#grad1)"${3}/>`;
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
  const { gid: api_scoped_id, st: api_static_fragment, h: api_element } = $api;
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
          [
            api_static_fragment($fragment1(), 4),
            api_static_fragment($fragment2(), 6),
          ]
        ),
      ]),
      api_static_fragment($fragment3(), 8),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
