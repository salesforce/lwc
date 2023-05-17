import { registerTemplate } from "lwc";
const stc0 = ["Click"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, h: api_element } = $api;
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
      stc0,
      384
    ),
    api_element(
      "div",
      {
        key: 1,
        on: {
          foo_bar: _m1 || ($ctx._m1 = api_bind($cmp.handleClick)),
        },
      },
      stc0,
      384
    ),
    api_element(
      "div",
      {
        key: 2,
        on: {
          foo_: _m2 || ($ctx._m2 = api_bind($cmp.handleClick)),
        },
      },
      stc0,
      384
    ),
    api_element(
      "div",
      {
        key: 3,
        on: {
          a123: _m3 || ($ctx._m3 = api_bind($cmp.handleClick)),
        },
      },
      stc0,
      384
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
