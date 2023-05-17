import { registerTemplate } from "lwc";
const stc0 = ["Conditional Text"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { fr: api_fragment } = $api;
  return [$cmp.visible ? api_fragment(0, stc0, 0) : null];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
