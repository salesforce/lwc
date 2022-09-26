import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  attrs: {
    name: "outside-slot",
  },
  key: 2,
};
const stc2 = [];
const stc3 = {
  attrs: {
    name: "outside-slot",
  },
  key: 3,
};
const stc4 = {
  key: 5,
};
const stc5 = {
  attrs: {
    name: "outside-slot",
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment, s: api_slot, h: api_element } = $api;
  return [
    $cmp.condition
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : $cmp.altCondition
      ? api_fragment(
          0,
          [
            api_element("div", stc0, [
              api_slot("outside-slot", stc1, stc2, $slotset),
            ]),
          ],
          0
        )
      : api_fragment(0, [api_slot("outside-slot", stc3, stc2, $slotset)], 0),
    $cmp.anotherCondition
      ? api_fragment(4, [api_text("Another Conditional Text")], 0)
      : $cmp.anotherAltCondition
      ? api_fragment(
          4,
          [
            api_element("div", stc4, [
              api_slot("outside-slot", stc5, stc2, $slotset),
            ]),
          ],
          0
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["outside-slot"];
tmpl.stylesheets = [];
