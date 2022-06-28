import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg width="200" height="200"${3}><image xlink:href="/foo.png" x="1" y="2" height="200" width="200"${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
