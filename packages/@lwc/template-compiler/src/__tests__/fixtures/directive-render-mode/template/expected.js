import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    name: "named",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot, f: api_flatten } = $api;
  return api_flatten([
    api_element("p", stc0, [api_text("Root")]),
    api_slot("", stc1, [api_text("Default")], $slotset),
    api_slot("named", stc2, [api_text("Named")], $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "named"];
tmpl.renderMode = "light";
