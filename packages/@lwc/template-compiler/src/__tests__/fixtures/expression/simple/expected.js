import { registerTemplate, renderApi } from "lwc";
const { d: api_dynamic_text, t: api_text } = renderApi;
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_text(api_dynamic_text($cmp.text))];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
