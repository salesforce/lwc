import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ncls: api_normalize_class_name, h: api_element } = $api;
  return [
    api_element("div", {
      className: api_normalize_class_name($cmp.computed),
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
