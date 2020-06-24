import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, b: api_bind, h: api_element } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_element(
      "section",
      {
        key: 4,
      },
      [
        api_element(
          "div",
          {
            key: 1,
            on: {
              click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
            },
          },
          [api_text("x", 0)]
        ),
        api_element(
          "div",
          {
            key: 3,
            on: {
              press: _m1 || ($ctx._m1 = api_bind($cmp.handlePress)),
            },
          },
          [api_text("x", 2)]
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
