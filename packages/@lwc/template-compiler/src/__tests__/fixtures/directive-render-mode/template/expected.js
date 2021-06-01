import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot, f: api_flatten } = $api;
  return api_flatten([
    api_element(
      "p",
      {
        key: 0,
      },
      [api_text("Root")]
    ),
    api_slot(
      "",
      {
        key: 1,
      },
      [api_text("Default")],
      $slotset
    ),
    api_slot(
      "named",
      {
        attrs: {
          name: "named",
        },
        key: 2,
      },
      [api_text("Named")],
      $slotset
    ),
  ]);
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "named"];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
