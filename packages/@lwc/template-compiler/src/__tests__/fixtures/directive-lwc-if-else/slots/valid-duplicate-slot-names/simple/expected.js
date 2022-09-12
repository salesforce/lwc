import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, fr: api_fragment } = $api;
  return [
    $cmp.condition
      ? api_fragment("if-fr0", [
          api_slot("conditional-slot", stc0, stc1, $slotset),
        ])
      : api_fragment("if-fr0", [
          api_slot("conditional-slot", stc2, stc1, $slotset),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["conditional-slot"];
tmpl.stylesheets = [];
