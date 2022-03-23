import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  classMap: {
    foo: true,
    bar: true,
    "baz-fiz": true,
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_element("section", stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
