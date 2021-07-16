import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { handleClick: $cv0_0 } = $cmp;
  const { b: api_bind, t: api_text, h: api_element } = $api;
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_element(
      "div",
      {
        key: 0,
        on: {
          a123: _m0 || ($ctx._m0 = api_bind($cv0_0)),
        },
      },
      [api_text("Click")]
    ),
    api_element(
      "div",
      {
        key: 1,
        on: {
          foo_bar: _m1 || ($ctx._m1 = api_bind($cv0_0)),
        },
      },
      [api_text("Click")]
    ),
    api_element(
      "div",
      {
        key: 2,
        on: {
          foo_: _m2 || ($ctx._m2 = api_bind($cv0_0)),
        },
      },
      [api_text("Click")]
    ),
    api_element(
      "div",
      {
        key: 3,
        on: {
          a123: _m3 || ($ctx._m3 = api_bind($cv0_0)),
        },
      },
      [api_text("Click")]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
