import { registerTemplate, sanitizeAttribute } from "lwc";
const stc0 = {
  classMap: {
    "slds-button__icon": true,
  },
  attrs: {
    viewBox: "0 0 5 5",
    "aria-hidden": "true",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("use", {
        attrs: {
          "xlink:href": sanitizeAttribute(
            "use",
            "http://www.w3.org/2000/svg",
            "xlink:href",
            "/x"
          ),
        },
        key: 1,
        svg: true,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
