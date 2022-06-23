import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<image xlink:href="/foo.png" x="1" y="2" height="200" width="200"${3}></image>`;
const stc0 = {
  attrs: {
    width: "200",
    height: "200",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [api_element("svg", stc0, [api_static_fragment($fragment1(), 2)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
