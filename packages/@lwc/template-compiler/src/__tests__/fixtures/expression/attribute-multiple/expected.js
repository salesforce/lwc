import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ncls: api_normalize_class_name, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        className: api_normalize_class_name($cmp.foo.c),
        key: 0,
      },
      [
        api_element("p", {
          className: api_normalize_class_name($cmp.bar.c),
          key: 1,
        }),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
