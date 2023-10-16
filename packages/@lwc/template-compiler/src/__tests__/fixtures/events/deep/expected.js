import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element("button", {
      attrs: {
        "data-dynamic": $cmp.dynamic,
      },
      key: 0,
      on: {
        click: _m0 || ($ctx._m0 = api_bind($cmp.foo.bar)),
      },
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
