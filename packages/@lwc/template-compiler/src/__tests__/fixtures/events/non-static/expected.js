import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element("div", stc0, [
      api_element("button", {
        key: 1,
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
