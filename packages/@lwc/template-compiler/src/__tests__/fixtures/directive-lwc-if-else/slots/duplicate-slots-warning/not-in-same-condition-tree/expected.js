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
  const { t: api_text, s: api_slot, h: api_element, fr: api_fragment } = $api;
  return [
    $cmp.condition
      ? api_fragment("if-fr0", [api_text("Conditional Text")])
      : api_fragment("if-fr0", [
          $cmp.altCondition
            ? api_fragment("if-fr0", [
                api_element("div", stc0, [
                  api_slot("outside-slot", stc1, stc2, $slotset),
                ]),
              ])
            : api_fragment("if-fr0", [
                api_slot("outside-slot", stc3, stc2, $slotset),
              ]),
        ]),
    $cmp.anotherCondition
      ? api_fragment("if-fr4", [api_text("Another Conditional Text")])
      : api_fragment("if-fr4", [
          $cmp.anotherAltCondition
            ? api_fragment("if-fr4", [
                api_element("div", stc4, [
                  api_slot("outside-slot", stc5, stc2, $slotset),
                ]),
              ])
            : api_fragment("if-fr4", stc2),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["outside-slot"];
tmpl.stylesheets = [];
