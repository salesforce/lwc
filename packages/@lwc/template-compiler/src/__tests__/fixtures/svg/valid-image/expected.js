import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "svg",
      {
        attrs: {
          width: "200",
          height: "200"
        },
        key: 1
      },
      [
        api_element(
          "image",
          {
            attrs: {
              "xlink:href": "/foo.png",
              x: "1",
              y: "2",
              height: "200",
              width: "200"
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
