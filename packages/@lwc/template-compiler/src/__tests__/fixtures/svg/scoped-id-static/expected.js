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
        key: 5
      },
      [
        api_element(
          "defs",
          {
            key: 2
          },
          [
            api_element(
              "circle",
              {
                attrs: {
                  id: api_scoped_id("black"),
                  r: "10",
                  cx: "10",
                  cy: "10",
                  fill: "black"
                },
                key: 0
              },
              []
            ),
            api_element(
              "circle",
              {
                attrs: {
                  id: api_scoped_id("red"),
                  r: "10",
                  cx: "14",
                  cy: "14",
                  fill: "red"
                },
                key: 1
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
                api_scoped_frag_id("#black")
              )
            },
            key: 3
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
                api_scoped_frag_id("#red")
              )
            },
            key: 4
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
