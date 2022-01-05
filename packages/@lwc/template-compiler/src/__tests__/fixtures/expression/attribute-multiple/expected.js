import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        className: $cmp.foo.c,
        key: 0,
      },
      [
        api_element(
          "p",
          {
            className: $cmp.bar.c,
            key: 1,
          },
          stc0
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
