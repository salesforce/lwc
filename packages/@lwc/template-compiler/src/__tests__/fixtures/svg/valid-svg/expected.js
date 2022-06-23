import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<a${3}></a>`;
const $fragment2 = parseSVGFragment`<circle${3}></circle>`;
const $fragment3 = parseSVGFragment`<defs${3}></defs>`;
const $fragment4 = parseSVGFragment`<desc${3}></desc>`;
const $fragment5 = parseSVGFragment`<ellipse${3}></ellipse>`;
const $fragment6 = parseSVGFragment`<filter${3}></filter>`;
const $fragment7 = parseSVGFragment`<g${3}></g>`;
const $fragment8 = parseSVGFragment`<line${3}></line>`;
const $fragment9 = parseSVGFragment`<marker${3}></marker>`;
const $fragment10 = parseSVGFragment`<mask${3}></mask>`;
const $fragment11 = parseSVGFragment`<path${3}></path>`;
const $fragment12 = parseSVGFragment`<pattern${3}></pattern>`;
const $fragment13 = parseSVGFragment`<polygon${3}></polygon>`;
const $fragment14 = parseSVGFragment`<polyline${3}></polyline>`;
const $fragment15 = parseSVGFragment`<rect${3}></rect>`;
const $fragment16 = parseSVGFragment`<stop${3}></stop>`;
const $fragment17 = parseSVGFragment`<symbol${3}></symbol>`;
const $fragment18 = parseSVGFragment`<text${3}></text>`;
const $fragment19 = parseSVGFragment`<title${3}></title>`;
const $fragment20 = parseSVGFragment`<tspan${3}></tspan>`;
const $fragment21 = parseSVGFragment`<use${3}></use>`;
const stc0 = {
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
      api_static_fragment($fragment4(), 8),
      api_static_fragment($fragment5(), 10),
      api_static_fragment($fragment6(), 12),
      api_static_fragment($fragment7(), 14),
      api_static_fragment($fragment8(), 16),
      api_static_fragment($fragment9(), 18),
      api_static_fragment($fragment10(), 20),
      api_static_fragment($fragment11(), 22),
      api_static_fragment($fragment12(), 24),
      api_static_fragment($fragment13(), 26),
      api_static_fragment($fragment14(), 28),
      api_static_fragment($fragment15(), 30),
      api_static_fragment($fragment16(), 32),
      api_static_fragment($fragment17(), 34),
      api_static_fragment($fragment18(), 36),
      api_static_fragment($fragment19(), 38),
      api_static_fragment($fragment20(), 40),
      api_static_fragment($fragment21(), 42),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
