import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [api_element("h1", stc0, [api_text("hello")])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
