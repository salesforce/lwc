import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "nested-slot",
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  key: 1,
};
const stc3 = {
  attrs: {
    name: "nested-slot",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, h: api_element, t: api_text } = $api;
  return $cmp.condition
    ? [
        api_slot("nested-slot", stc0, stc1, $slotset),
        api_element("div", stc2, [
          api_slot("nested-slot", stc3, stc1, $slotset),
        ]),
      ]
    : [api_text("Alternative Text")];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["nested-slot"];
tmpl.stylesheets = [];
