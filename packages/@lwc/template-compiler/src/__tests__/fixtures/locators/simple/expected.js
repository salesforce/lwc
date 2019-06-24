import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { fb: function_bind, ll: locator_listener, h: api_element } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_element(
      "a",
      {
        context: {
          locator: {
            id: "link",
            context: _m0 || ($ctx._m0 = function_bind($cmp.contextFn))
          }
        },
        key: 1,
        on: {
          click:
            _m1 ||
            ($ctx._m1 = locator_listener(
              $cmp.clickHandler,
              "link",
              function_bind($cmp.contextFn)
            ))
        }
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
