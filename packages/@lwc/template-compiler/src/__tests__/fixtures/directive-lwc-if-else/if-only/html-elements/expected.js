import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}></h1>`;
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return $cmp.visible ? [api_static_fragment($fragment1(), 1)] : stc0;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
