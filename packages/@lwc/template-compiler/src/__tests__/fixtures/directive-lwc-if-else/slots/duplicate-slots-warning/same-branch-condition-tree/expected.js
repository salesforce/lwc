import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "nested-slot",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  key: 2,
};
const stc3 = {
  attrs: {
    name: "nested-slot",
  },
  key: 3,
};
const stc4 = ["Alternative Text"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, h: api_element, fr: api_fragment } = $api;
  return [
    $cmp.condition
      ? api_fragment(
          0,
          [
            api_slot("nested-slot", stc0, stc1, $slotset),
            api_element(
              "div",
              stc2,
              [api_slot("nested-slot", stc3, stc1, $slotset)],
              0
            ),
          ],
          0
        )
      : api_fragment(0, stc4, 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["nested-slot"];
tmpl.stylesheets = [];
