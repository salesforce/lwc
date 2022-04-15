import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input type="checkbox" required readonly minlength="5" maxlength="10" checked${3}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
