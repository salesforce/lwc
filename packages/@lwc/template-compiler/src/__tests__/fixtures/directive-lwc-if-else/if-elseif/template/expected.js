import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text } = $api;
  return $cmp.visible
    ? [api_text("Conditional Text")]
    : $cmp.displayAlt
    ? [api_text("Elseif!")]
    : stc0;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
