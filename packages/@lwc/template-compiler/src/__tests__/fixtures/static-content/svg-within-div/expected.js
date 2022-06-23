import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<path${3}></path>`;
const $fragment2 = parseSVGFragment`<path${3}></path>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 1,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("div", stc0, [
      api_element("svg", stc1, [
        api_static_fragment($fragment1(), 3),
        api_static_fragment($fragment2(), 5),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
