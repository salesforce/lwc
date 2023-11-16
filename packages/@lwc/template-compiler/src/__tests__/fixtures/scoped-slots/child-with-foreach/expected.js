import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, s: api_slot, i: api_iterator } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_slot(
      "",
      {
        key: api_key(0, item.id),
        slotData: item,
      },
      stc0,
      $slotset
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
