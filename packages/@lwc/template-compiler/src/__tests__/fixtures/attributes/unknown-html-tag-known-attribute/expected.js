import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    min: "4",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("somefancytag", stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
