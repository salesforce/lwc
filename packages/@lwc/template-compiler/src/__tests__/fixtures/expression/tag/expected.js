import { registerTemplate, renderApi } from "lwc";
const { d: api_dynamic_text, t: api_text, h: api_element } = renderApi;
const stc0 = {
  key: 0,
};
function tmpl($cmp, $slotset, $ctx) {
  return [api_element("p", stc0, [api_text(api_dynamic_text($cmp.text))])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
