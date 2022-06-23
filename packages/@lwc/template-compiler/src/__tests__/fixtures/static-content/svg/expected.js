import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<path${3}></path>`;
const $fragment2 = parseSVGFragment`<path${3}></path>`;
const stc0 = {
  attrs: {
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
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
