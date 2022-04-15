import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><color-profile local="x"${3}></color-profile></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
