import { registerTemplate, sanitizeAttribute } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "svg",
      {
        classMap: {
          "slds-button__icon": true,
        },
        attrs: {
          viewBox: "0 0 5 5",
          "aria-hidden": "true",
        },
        key: 0,
      },
      [
        api_element(
          "use",
          {
            attrs: {
              "xlink:href": sanitizeAttribute(
                "use",
                "http://www.w3.org/2000/svg",
                "xlink:href",
                "/x"
              ),
            },
            key: 1,
          },
          []
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
