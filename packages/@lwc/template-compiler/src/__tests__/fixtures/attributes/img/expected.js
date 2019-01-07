import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "img",
      {
        attrs: {
          src: "http://www.example.com/image.png",
          crossorigin: "anonymous"
        },
        key: 2
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
