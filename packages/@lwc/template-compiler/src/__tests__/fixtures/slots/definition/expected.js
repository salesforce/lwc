import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element("section", stc0, [
      api_slot(
        "",
        stc1,
        [api_element("p", stc2, [api_text("Default slot content")])],
        $slotset
      ),
    ]),
  ];
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
