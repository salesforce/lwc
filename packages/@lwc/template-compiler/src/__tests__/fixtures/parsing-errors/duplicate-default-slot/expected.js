import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "",
      {
        key: 0,
      },
      [],
      $slotset
    ),
    api_slot(
      "",
      {
        key: 1,
      },
      [],
      $slotset
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
