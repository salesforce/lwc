import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "slotname1",
  },
  key: 1,
};
const stc3 = {
  attrs: {
    name: "slotname2",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, f: api_flatten } = $api;
  return api_flatten([
    api_slot("", stc0, stc1, $slotset),
    api_slot("slotname1", stc2, stc1, $slotset),
    api_slot("slotname2", stc3, stc1, $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
