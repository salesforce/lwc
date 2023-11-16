import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, s: api_slot } = $api;
  return [
    api_slot(
      "",
      {
        key: 0,
        slotData: $cmp.item,
      },
      [api_text("Foo " + api_dynamic_text($cmp.item))],
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.renderMode = "light";
