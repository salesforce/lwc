import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<g transform="translate(3,3)"${3}><g transform="translate(250,0)"${3}><foreignObject width="200" height="36" xlink:href="javascript:alert(1)"${3}><a${3}>x</a></foreignObject></g></g>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    width: "706",
    height: "180",
  },
  key: 1,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("div", stc0, [
      api_element("svg", stc1, [api_static_fragment($fragment1(), 3)]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
