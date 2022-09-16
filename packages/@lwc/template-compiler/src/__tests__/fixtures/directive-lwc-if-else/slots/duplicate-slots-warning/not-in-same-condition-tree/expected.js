import { registerTemplate } from "lwc";
const stc0 = {
  key: 2,
};
const stc1 = {
  attrs: {
    name: "outside-slot",
  },
  key: 3,
};
const stc2 = [];
const stc3 = {
  attrs: {
    name: "outside-slot",
  },
  key: 4,
};
const stc4 = {
  key: 6,
};
const stc5 = {
  attrs: {
    name: "outside-slot",
  },
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment, s: api_slot, h: api_element } = $api;
  return [
    $cmp.condition
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : api_fragment(
          0,
          [
            $cmp.altCondition
              ? api_fragment(
                  1,
                  [
                    api_element("div", stc0, [
                      api_slot("outside-slot", stc1, stc2, $slotset),
                    ]),
                  ],
                  0
                )
              : api_fragment(
                  1,
                  [api_slot("outside-slot", stc3, stc2, $slotset)],
                  0
                ),
          ],
          0
        ),
    $cmp.anotherCondition
      ? api_fragment(5, [api_text("Another Conditional Text")], 0)
      : api_fragment(
          5,
          [
            $cmp.anotherAltCondition
              ? api_fragment(
                  5,
                  [
                    api_element("div", stc4, [
                      api_slot("outside-slot", stc5, stc2, $slotset),
                    ]),
                  ],
                  0
                )
              : null,
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["outside-slot"];
tmpl.stylesheets = [];
