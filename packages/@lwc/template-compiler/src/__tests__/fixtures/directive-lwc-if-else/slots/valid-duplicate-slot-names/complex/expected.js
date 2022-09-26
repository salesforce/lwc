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
  key: 3,
};
const stc3 = {
  key: 6,
};
const stc4 = {
  key: 7,
};
const stc5 = {
  attrs: {
    name: "nested-slot",
  },
  key: 8,
};
const stc6 = {
  attrs: {
    name: "nested-slot",
  },
  key: 9,
};
const stc7 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 10,
};
const stc8 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 11,
};
const stc9 = {
  attrs: {
    name: "nested-slot",
  },
  key: 12,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, t: api_text, fr: api_fragment, h: api_element } = $api;
  return [
    api_slot("outer-slot", stc0, stc1, $slotset),
    $cmp.condition
      ? api_fragment(
          1,
          [
            $cmp.nested
              ? api_fragment(
                  2,
                  [
                    api_text("Conditional Nested Text"),
                    api_slot("nested-slot", stc2, stc1, $slotset),
                  ],
                  0
                )
              : api_fragment(
                  2,
                  [
                    $cmp.doubleNested
                      ? api_fragment(4, [api_text("Double Nested")], 0)
                      : $cmp.doubleNestedAlt
                      ? api_fragment(
                          4,
                          [
                            $cmp.tripleNested
                              ? api_fragment(
                                  5,
                                  [
                                    api_element("div", stc3, [
                                      api_element("div", stc4, [
                                        api_text("Triple Nested Text"),
                                        api_slot(
                                          "nested-slot",
                                          stc5,
                                          stc1,
                                          $slotset
                                        ),
                                      ]),
                                    ]),
                                  ],
                                  0
                                )
                              : null,
                          ],
                          0
                        )
                      : api_fragment(
                          4,
                          [
                            api_text("Else"),
                            api_slot("nested-slot", stc6, stc1, $slotset),
                          ],
                          0
                        ),
                  ],
                  0
                ),
            api_slot("conditional-slot", stc7, stc1, $slotset),
          ],
          0
        )
      : api_fragment(
          1,
          [
            api_slot("conditional-slot", stc8, stc1, $slotset),
            api_slot("nested-slot", stc9, stc1, $slotset),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["conditional-slot", "nested-slot", "outer-slot"];
tmpl.stylesheets = [];
