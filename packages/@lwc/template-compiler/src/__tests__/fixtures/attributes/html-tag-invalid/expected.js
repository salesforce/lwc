import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><textarea minlength="1" maxlength="5" unknown-attr="should-error"${3}>x</textarea></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
