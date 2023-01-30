import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [$cmp.ifTrue ? api_static_fragment($fragment1(), 1) : null];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
