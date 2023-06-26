import _xPert from "x/pert";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  props: {
    attr: {
      obj: "literal",
    },
  },
  key: 1,
};
const stc2 = {
  obj: "literal",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, stc1, [
        api_text(api_dynamic_text(stc2.toString())),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
