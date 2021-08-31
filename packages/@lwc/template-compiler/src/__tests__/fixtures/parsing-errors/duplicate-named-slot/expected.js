import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "foo",
      {
        attrs: {
          name: "foo",
        },
        key: 0,
      },
      [],
      $slotset
    ),
    api_slot(
      "foo",
      {
        attrs: {
          name: "foo",
        },
        key: 1,
      },
      [],
      $slotset
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.slots = ["foo"];
tmpl.stylesheets = [];
