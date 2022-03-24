import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, s: api_slot, f: api_flatten } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 0,
  },
  [api_text("Root")],
  true
);
const stc0 = {
  key: 1,
};
const stc1 = {
  attrs: {
    name: "named",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return api_flatten([
    $hoisted1,
    api_slot("", stc0, [api_text("Default")], $slotset),
    api_slot("named", stc1, [api_text("Named")], $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
