import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><svg width="706" height="180"${3}><g transform="translate(3,3)"${3}><g transform="translate(250,0)"${3}><foreignObject width="200" height="36" xlink:href="javascript:alert(1)"${3}><a${3}>x</a></foreignObject></g></g></svg></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
