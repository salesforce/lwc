import { registerTemplate } from "lwc";
const stc0 = ["Conditional Text"];
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    name: "outside-slot",
  },
  key: 2,
};
const stc3 = [];
const stc4 = {
  attrs: {
    name: "outside-slot",
  },
  key: 3,
};
const stc5 = ["Another Conditional Text"];
const stc6 = {
  key: 5,
};
const stc7 = {
  attrs: {
    name: "outside-slot",
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { fr: api_fragment, s: api_slot, h: api_element } = $api;
  return [
    $cmp.condition
      ? api_fragment(0, stc0, 0)
      : $cmp.altCondition
      ? api_fragment(
          0,
          [
            api_element(
              "div",
              stc1,
              [api_slot("outside-slot", stc2, stc3, $slotset)],
              0
            ),
          ],
          0
        )
      : api_fragment(0, [api_slot("outside-slot", stc4, stc3, $slotset)], 0),
    $cmp.anotherCondition
      ? api_fragment(4, stc5, 0)
      : $cmp.anotherAltCondition
      ? api_fragment(
          4,
          [
            api_element(
              "div",
              stc6,
              [api_slot("outside-slot", stc7, stc3, $slotset)],
              0
            ),
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
