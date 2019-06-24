import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { fb: function_bind, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element(
      "div",
      {
        context: {
          lwc: {
            dom: "manual"
          },
          locator: {
            id: "button-in-slot",
            context: _m0 || ($ctx._m0 = function_bind($cmp.locatorProvider))
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
