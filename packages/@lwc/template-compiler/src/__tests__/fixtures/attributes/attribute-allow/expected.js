import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "iframe",
      {
        attrs: {
          allow: "geolocation https://google-developers.appspot.com"
        },
        key: 2
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
