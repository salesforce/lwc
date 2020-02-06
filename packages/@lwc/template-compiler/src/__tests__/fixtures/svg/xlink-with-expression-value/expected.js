import { registerTemplate, sanitizeAttribute } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { fid: api_scoped_frag_id, h: api_element } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          "aria-hidden": "true",
          class: "slds-icon",
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
                api_scoped_frag_id($cmp.getXLink)
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
