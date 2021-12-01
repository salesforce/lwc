import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    foo: true,
    bar: true,
    "baz-fiz": true,
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("section", stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
