import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return api_slot(
    "",
    {
      key: 0,
      slotData: $cmp.item,
    },
    stc0,
    $slotset
  );
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
