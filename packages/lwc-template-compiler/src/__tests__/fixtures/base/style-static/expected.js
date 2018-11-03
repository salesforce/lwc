import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "section",
      {
        styleMap: {
          fontSize: "12px",
          color: "red",
          margin: "10px 5px 10px"
        },
        key: 2
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
