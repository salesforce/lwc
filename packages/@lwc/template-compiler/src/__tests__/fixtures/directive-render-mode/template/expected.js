import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  so: api_set_owner,
  s: api_slot,
  f: api_flatten,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 0,
  },
  [api_text("Root")],
  true
);
const $hoisted2 = api_text("Default", true);
const $hoisted3 = api_text("Named", true);
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
    api_set_owner($hoisted1),
    api_slot("", stc0, [api_set_owner($hoisted2)], $slotset),
    api_slot("named", stc1, [api_set_owner($hoisted3)], $slotset),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
