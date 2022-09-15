import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "james",
  },
  key: 1,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, s: api_slot, h: api_element, i: api_iterator } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_element(
      "div",
      {
        key: api_key(0, item),
      },
      [api_slot("james", stc0, stc1, $slotset)]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["james"];
tmpl.stylesheets = [];
