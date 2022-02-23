import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("h1", stc0, [api_text("hello")]),
    api_element("br", stc1),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
