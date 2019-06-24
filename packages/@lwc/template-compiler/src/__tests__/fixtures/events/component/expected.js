import _nsFoo from "ns/foo";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, c: api_custom_element, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element(
      "section",
      {
        key: 2
      },
      [
        api_custom_element(
          "ns-foo",
          _nsFoo,
          {
            key: 1,
            on: {
              foo: _m0 || ($ctx._m0 = api_bind($cmp.handleFoo))
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
