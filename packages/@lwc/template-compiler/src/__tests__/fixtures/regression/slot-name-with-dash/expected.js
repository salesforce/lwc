import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, s: api_slot } = renderApi;
const stc0 = {
  attrs: {
    name: "secret-slot",
  },
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_slot(
      "secret-slot",
      stc0,
      [api_element("p", stc1, [api_text("Test slot content")])],
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["secret-slot"];
tmpl.stylesheets = [];
