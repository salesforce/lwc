import _xCmp from "x/cmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element(
      "x-cmp",
      _xCmp,
      {
        classMap: {
          foo: true
        },
        props: {
          xClass: "bar"
        },
        key: 1
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
