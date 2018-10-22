import _xCmp from "x/cmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;

  return [
    api_custom_element(
      "x-cmp",
      _xCmp,
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
