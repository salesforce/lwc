import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, b: api_bind, h: api_element } = $api;
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_element(
      "div",
      {
        key: 1,
        on: {
          a123: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
        },
      },
      [api_text("Click", 0)]
    ),
    api_element(
      "div",
      {
        key: 3,
        on: {
          foo_bar: _m1 || ($ctx._m1 = api_bind($cmp.handleClick)),
        },
      },
      [api_text("Click", 2)]
    ),
    api_element(
      "div",
      {
        key: 5,
        on: {
          foo_: _m2 || ($ctx._m2 = api_bind($cmp.handleClick)),
        },
      },
      [api_text("Click", 4)]
    ),
    api_element(
      "div",
      {
        key: 7,
        on: {
          a123: _m3 || ($ctx._m3 = api_bind($cmp.handleClick)),
        },
      },
      [api_text("Click", 6)]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
