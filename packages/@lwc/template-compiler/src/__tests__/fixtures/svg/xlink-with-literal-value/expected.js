import { registerTemplate, renderApi, sanitizeAttribute } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "svg",
  {
    classMap: {
      "slds-icon": true,
    },
    attrs: {
      "aria-hidden": "true",
      title: "when needed",
    },
    key: 0,
    svg: true,
    isStatic: true,
  },
  [
    api_element("use", {
      attrs: {
        "xlink:href": sanitizeAttribute(
          "use",
          "http://www.w3.org/2000/svg",
          "xlink:href",
          "/assets/icons/standard-sprite/svg/symbols.svg#case"
        ),
      },
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
