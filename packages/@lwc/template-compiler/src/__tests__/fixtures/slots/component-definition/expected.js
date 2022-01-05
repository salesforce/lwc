import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, c: api_custom_element } = $api;
  return [
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        key: 0,
      },
      [
        api_slot(
          "",
          {
            key: 1,
          },
          [],
          $slotset
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
