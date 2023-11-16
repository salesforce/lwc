import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "slotname1",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  name: "slotname1",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, fr: api_fragment } = $api;
  return [
    $cmp.showStandard
      ? api_fragment(0, [api_slot("slotname1", stc0, stc1, $slotset)], 0)
      : $cmp.showVariant
      ? api_fragment(
          0,
          [
            api_slot(
              "slotname1",
              {
                attrs: stc2,
                key: 2,
                slotData: $cmp.slot1VariantData,
              },
              stc1,
              $slotset
            ),
          ],
          0
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["slotname1"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
