import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div style="background: blue !important; color: red; opacity: 0.5 !important"${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
