import { registerTemplate, renderApi } from "lwc";
const {
  b: api_bind,
  t: api_text,
  so: api_set_owner,
  h: api_element,
} = renderApi;
const $hoisted1 = api_text("x");
const $hoisted2 = api_text("x");
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
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
        [api_set_owner($hoisted1)]
      ),
      api_element(
        "div",
        {
          key: 2,
          on: {
            press: _m1 || ($ctx._m1 = api_bind($cmp.handlePress)),
          },
        },
        [api_set_owner($hoisted2)]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
