import { registerTemplate } from "lwc";
const stc0 = {
  name: "slotname1",
};
const stc1 = [];
const stc2 = {
  name: "slotname2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "slotname1",
      {
        attrs: stc0,
        key: 0,
        slotData: $cmp.slot1data,
      },
      stc1,
      $slotset
    ),
    api_slot(
      "slotname2",
      {
        attrs: stc2,
        key: 1,
        slotData: $cmp.slot2data,
      },
      stc1,
      $slotset
    ),
    api_slot(
      "",
      {
        key: 2,
        slotData: $cmp.defaultdata,
      },
      stc1,
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
