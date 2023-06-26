import _xPert from "x/pert";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  props: {
    attr: 75,
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_element("section", stc0, [api_custom_element("x-pert", _xPert, stc1)]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
