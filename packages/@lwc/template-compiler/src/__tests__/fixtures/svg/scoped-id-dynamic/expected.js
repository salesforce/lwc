import { registerTemplate, sanitizeAttribute } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element, fid: api_scoped_frag_id } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          width: "100px",
          height: "100px",
          viewport: "0 0 100 100"
        },
        key: 6
      },
      [
        api_element(
          "defs",
          {
            key: 3
          },
          [
            api_element(
              "circle",
              {
                attrs: {
                  id: api_scoped_id($cmp.blackId),
                  r: "10",
                  cx: "10",
                  cy: "10",
                  fill: "black"
                },
                key: 1
              },
              []
            ),
            api_element(
              "circle",
              {
                attrs: {
                  id: api_scoped_id($cmp.redId),
                  r: "10",
                  cx: "14",
                  cy: "14",
                  fill: "red"
                },
                key: 2
              },
              []
            )
          ]
        ),
        api_element(
          "use",
          {
            attrs: {
              href: sanitizeAttribute(
                "use",
                "http://www.w3.org/2000/svg",
                "href",
                api_scoped_frag_id($cmp.blackUrl)
              )
            },
            key: 4
          },
          []
        ),
        api_element(
          "use",
          {
            attrs: {
              "xlink:href": sanitizeAttribute(
                "use",
                "http://www.w3.org/2000/svg",
                "xlink:href",
                api_scoped_frag_id($cmp.redUrl)
              )
            },
            key: 5
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
