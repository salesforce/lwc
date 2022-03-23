import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  attrs: {
    min: "4",
  },
  key: 0,
};
function tmpl($cmp, $slotset, $ctx) {
  return [api_element("somefancytag", stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
