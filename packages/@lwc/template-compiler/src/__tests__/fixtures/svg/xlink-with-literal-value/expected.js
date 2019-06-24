import { registerTemplate, sanitizeAttribute } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "svg",
      {
        classMap: {
          "slds-icon": true
        },
        attrs: {
          "aria-hidden": "true",
          title: "when needed"
        },
        key: 1
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
                "/assets/icons/standard-sprite/svg/symbols.svg#case"
              )
            },
            key: 0
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
