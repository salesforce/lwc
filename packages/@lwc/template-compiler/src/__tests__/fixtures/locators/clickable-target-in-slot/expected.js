import _xSomeCmp from "x/someCmp";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fb: function_bind,
    ll: locator_listener,
    h: api_element,
    c: api_custom_element
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_custom_element(
      "x-some-cmp",
      _xSomeCmp,
      {
        key: 1
      },
      [
        api_element(
          "button",
          {
            context: {
              locator: {
                id: "button-in-slot",
                context: _m0 || ($ctx._m0 = function_bind($cmp.locatorProvider))
              }
            },
            key: 0,
            on: {
              click:
                _m1 ||
                ($ctx._m1 = locator_listener(
                  $cmp.handleClick,
                  "button-in-slot",
                  function_bind($cmp.locatorProvider)
                ))
            }
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
