import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  const { _m0 } = $ctx;
  return [
    api_element(
      "section",
      {
        key: 0,
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.bar.arr[$cmp.baz])),
        },
      },
      [
        api_text(
          api_dynamic_text($cmp.bar.arr[$cmp.baz]) +
            " " +
            api_dynamic_text($cmp.bar.baz.arr[$cmp.quux]) +
            " " +
            api_dynamic_text($cmp.bar.arr[$cmp.baz.quux])
        ),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
