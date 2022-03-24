import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, s: api_slot } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 2,
  },
  [api_text("Default slot content")],
  true
);
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [api_slot("", stc1, [$hoisted1], $slotset)]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
