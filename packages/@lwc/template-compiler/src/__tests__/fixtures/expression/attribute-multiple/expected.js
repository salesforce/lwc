import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_element(
      "section",
      {
        className: $cmp.foo.c,
        key: 0,
      },
      [
        api_element("p", {
          className: $cmp.bar.c,
          key: 1,
        }),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
