import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  so: api_set_owner,
  s: api_slot,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 1,
  },
  [api_text("Test slot content")]
);
const stc0 = {
  attrs: {
    name: "secret-slot",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_slot("secret-slot", stc0, [api_set_owner($hoisted1)], $slotset)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["secret-slot"];
tmpl.stylesheets = [];
