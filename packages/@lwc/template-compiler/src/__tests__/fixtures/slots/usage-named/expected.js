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
    key: 2,
  },
  [api_text("Test slot content")]
);
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "test",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      api_slot("test", stc1, [api_set_owner($hoisted1)], $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["test"];
tmpl.stylesheets = [];
