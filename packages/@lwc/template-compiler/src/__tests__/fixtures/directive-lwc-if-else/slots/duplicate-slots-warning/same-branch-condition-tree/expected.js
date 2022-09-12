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
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, h: api_element, t: api_text, fr: api_fragment } = $api;
  return [
    $cmp.condition
      ? api_fragment("if-fr0", [
          api_slot("nested-slot", stc0, stc1, $slotset),
          api_element("div", stc2, [
            api_slot("nested-slot", stc3, stc1, $slotset),
          ]),
        ])
      : api_fragment("if-fr0", [api_text("Alternative Text")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["nested-slot"];
tmpl.stylesheets = [];
