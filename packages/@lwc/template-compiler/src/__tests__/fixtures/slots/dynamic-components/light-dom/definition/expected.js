import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "head",
  },
  key: 1,
};
const stc2 = [];
const stc3 = {
  attrs: {
    name: "body",
  },
  key: 2,
};
const stc4 = {
  attrs: {
    name: "footer",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_slot("head", stc1, stc2, $slotset),
      api_slot("body", stc3, stc2, $slotset),
      api_slot("footer", stc4, stc2, $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["body", "footer", "head"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
