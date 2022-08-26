import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "outside-slot",
  },
  key: 1,
};
const stc2 = [];
const stc3 = {
  attrs: {
    name: "outside-slot",
  },
  key: 2,
};
const stc4 = {
  key: 3,
};
const stc5 = {
  attrs: {
    name: "outside-slot",
  },
  key: 4,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, s: api_slot, h: api_element, f: api_flatten } = $api;
  return api_flatten([
    $cmp.condition
      ? [api_text("Conditional Text")]
      : $cmp.altCondition
      ? [
          api_element("div", stc0, [
            api_slot("outside-slot", stc1, stc2, $slotset),
          ]),
        ]
      : [api_slot("outside-slot", stc3, stc2, $slotset)],
    $cmp.anotherCondition
      ? [api_text("Another Conditional Text")]
      : $cmp.anotherAltCondition
      ? [
          api_element("div", stc4, [
            api_slot("outside-slot", stc5, stc2, $slotset),
          ]),
        ]
      : stc2,
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["outside-slot"];
tmpl.stylesheets = [];
