import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, f: api_flatten } = $api;
  return api_flatten([
    $cmp.visible ? [api_text("Conditional Text")] : [api_text("Else!")],
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
