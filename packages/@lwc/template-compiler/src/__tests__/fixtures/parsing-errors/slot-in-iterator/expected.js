import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    s: api_slot,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_fragment(
      1,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            key: item,
          },
          [api_slot("", stc0, stc1, $slotset)]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
