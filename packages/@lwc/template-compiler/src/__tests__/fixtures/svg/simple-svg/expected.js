import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<rect width="100%" height="100%" fill="red"${3}></rect>`;
const $fragment2 = parseSVGFragment`<circle cx="150" cy="100" r="80" fill="green"${3}></circle>`;
const $fragment3 = parseSVGFragment`<text x="150" y="125" font-size="60" text-anchor="middle" fill="white"${3}>SVG</text>`;
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
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_static_fragment($fragment1(), 2),
      api_static_fragment($fragment2(), 4),
      api_static_fragment($fragment3(), 6),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
