import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  name: "slotname1",
};
const stc2 = [];
const stc3 = {
  key: 2,
};
const stc4 = {
  name: "slotname2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor1, stc0, [
      api_slot(
        "slotname1",
        {
          attrs: stc1,
          key: 1,
          slotData: $cmp.slot1data,
        },
        stc2,
        $slotset
      ),
    ]),
    api_dynamic_component($cmp.ctor2, stc3, [
      api_slot(
        "slotname2",
        {
          attrs: stc4,
          key: 3,
          slotData: $cmp.slot2data,
        },
        stc2,
        $slotset
      ),
    ]),
    api_slot(
      "",
      {
        key: 4,
        slotData: $cmp.defaultdata,
      },
      stc2,
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
