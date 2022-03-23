import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    "data--bar-baz": "xyz",
  },
  key: 1,
};
function tmpl($cmp, $slotset, $ctx) {
  return [api_element("section", stc0, [api_element("p", stc1)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
