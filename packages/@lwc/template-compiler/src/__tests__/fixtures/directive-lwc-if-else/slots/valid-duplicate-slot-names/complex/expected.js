import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "outer-slot",
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "nested-slot",
  },
  key: 1,
};
const stc3 = {
  key: 2,
};
const stc4 = {
  key: 3,
};
const stc5 = {
  attrs: {
    name: "nested-slot",
  },
  key: 4,
};
const stc6 = {
  attrs: {
    name: "nested-slot",
  },
  key: 5,
};
const stc7 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 6,
};
const stc8 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 7,
};
const stc9 = {
  attrs: {
    name: "nested-slot",
  },
  key: 8,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, t: api_text, h: api_element, f: api_flatten } = $api;
  return api_flatten([
    api_slot("outer-slot", stc0, stc1, $slotset),
    $cmp.condition
      ? api_flatten([
          $cmp.nested
            ? [
                api_text("Conditional Nested Text"),
                api_slot("nested-slot", stc2, stc1, $slotset),
              ]
            : $cmp.doubleNested
            ? [api_text("Double Nested")]
            : $cmp.doubleNestedAlt
            ? $cmp.tripleNested
              ? [
                  api_element("div", stc3, [
                    api_element("div", stc4, [
                      api_text("Triple Nested Text"),
                      api_slot("nested-slot", stc5, stc1, $slotset),
                    ]),
                  ]),
                ]
              : stc1
            : [api_text("Else"), api_slot("nested-slot", stc6, stc1, $slotset)],
          api_slot("conditional-slot", stc7, stc1, $slotset),
        ])
      : [
          api_slot("conditional-slot", stc8, stc1, $slotset),
          api_slot("nested-slot", stc9, stc1, $slotset),
        ],
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["conditional-slot", "nested-slot", "outer-slot"];
tmpl.stylesheets = [];
