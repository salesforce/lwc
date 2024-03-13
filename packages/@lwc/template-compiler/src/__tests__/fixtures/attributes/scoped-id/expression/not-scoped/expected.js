import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", {
      attrs: {
        "aria-described-by": $cmp.scoped,
        "aria-active-descendant": $cmp.scoped,
        "aria-error-message": $cmp.scoped,
        "aria-flow-to": $cmp.scoped,
        "aria-labelled-by": $cmp.scoped,
      },
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
