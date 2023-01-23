import { registerTemplate } from "lwc";
const stc0 = [];
const stc1 = {
  name: "slotname1",
};
const stc2 = {
  name: "slotname2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "",
      {
        key: 0,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
    api_slot(
      "slotname1",
      {
        attrs: stc1,
        key: 1,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
    api_slot(
      "slotname2",
      {
        attrs: stc2,
        key: 2,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
