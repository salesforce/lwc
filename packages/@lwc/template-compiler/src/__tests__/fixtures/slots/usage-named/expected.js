import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "test",
  },
  key: 1,
};
const stc2 = {
  key: "@test:2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element("section", stc0, [
      api_slot(
        "test",
        stc1,
        [api_element("p", stc2, [api_text("Test slot content")])],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["test"];
