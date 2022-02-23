import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, t: api_text, h: api_element } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_element("section", stc0, [
      api_element(
        "div",
        {
          key: 1,
          on: {
            click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
          },
        },
        [api_text("x")]
      ),
      api_element(
        "div",
        {
          key: 2,
          on: {
            press: _m1 || ($ctx._m1 = api_bind($cmp.handlePress)),
          },
        },
        [api_text("x")]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
