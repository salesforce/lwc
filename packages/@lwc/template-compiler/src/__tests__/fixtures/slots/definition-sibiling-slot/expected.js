import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "other",
  },
  key: 1,
};
const stc2 = {
  key: "@other:2",
};
const stc3 = {
  key: 3,
};
const stc4 = {
  key: "@:4",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element("section", stc0, [
      api_slot(
        "other",
        stc1,
        [api_element("p", stc2, [api_text("Default slot other content")])],
        $slotset
      ),
      api_slot(
        "",
        stc3,
        [api_element("p", stc4, [api_text("Default slot content")])],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "other"];
