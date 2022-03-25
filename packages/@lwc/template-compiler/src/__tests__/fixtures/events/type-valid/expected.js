import { registerTemplate, renderApi } from "lwc";
const {
  b: api_bind,
  t: api_text,
  so: api_set_owner,
  h: api_element,
} = renderApi;
const $hoisted1 = api_text("Click", true);
const $hoisted2 = api_text("Click", true);
const $hoisted3 = api_text("Click", true);
const $hoisted4 = api_text("Click", true);
function tmpl($api, $cmp, $slotset, $ctx) {
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_element(
      "div",
      {
        key: 0,
        on: {
          a123: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
        },
      },
      [api_set_owner($hoisted1)]
    ),
    api_element(
      "div",
      {
        key: 1,
        on: {
          foo_bar: _m1 || ($ctx._m1 = api_bind($cmp.handleClick)),
        },
      },
      [api_set_owner($hoisted2)]
    ),
    api_element(
      "div",
      {
        key: 2,
        on: {
          foo_: _m2 || ($ctx._m2 = api_bind($cmp.handleClick)),
        },
      },
      [api_set_owner($hoisted3)]
    ),
    api_element(
      "div",
      {
        key: 3,
        on: {
          a123: _m3 || ($ctx._m3 = api_bind($cmp.handleClick)),
        },
      },
      [api_set_owner($hoisted4)]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
