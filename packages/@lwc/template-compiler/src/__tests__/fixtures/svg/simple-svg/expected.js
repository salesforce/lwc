import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    version: "1.1",
    baseProfile: "full",
    width: "300",
    height: "200",
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  attrs: {
    width: "100%",
    height: "100%",
    fill: "red",
  },
  key: 1,
  svg: true,
};
const stc2 = {
  attrs: {
    cx: "150",
    cy: "100",
    r: "80",
    fill: "green",
  },
  key: 2,
  svg: true,
};
const stc3 = {
  attrs: {
    x: "150",
    y: "125",
    "font-size": "60",
    "text-anchor": "middle",
    fill: "white",
  },
  key: 3,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text } = $api;
  return [
    api_element("svg", stc0, [
      api_element("rect", stc1),
      api_element("circle", stc2),
      api_element("text", stc3, [api_text("SVG")]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
