import _xSomeCmp from "x/someCmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { fb: function_bind, c: api_custom_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_custom_element(
      "x-some-cmp",
      _xSomeCmp,
      {
        context: {
          locator: {
            id: "some-locator",
            context: _m0 || ($ctx._m0 = function_bind($cmp.someProvider))
          }
        },
        key: 1
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
