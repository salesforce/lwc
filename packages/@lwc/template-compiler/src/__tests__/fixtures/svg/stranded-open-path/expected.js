import { registerTemplate, renderApi } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "svg",
  {
    attrs: {
      xmlns: "http://www.w3.org/2000/svg",
    },
    key: 0,
    svg: true,
    isStatic: true,
  },
  [
    api_element("path", {
      key: 1,
      svg: true,
      isStatic: true,
    }),
  ]
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
