import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        attrs: {
          foo: $cmp.bar.arr[$cmp.baz],
        },
        key: 0,
      },
      [api_text(api_dynamic_text($cmp.bar.arr[$cmp.baz]))]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
