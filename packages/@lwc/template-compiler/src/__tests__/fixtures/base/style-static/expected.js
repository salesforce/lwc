import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        styleMap: {
          "font-size": "12px",
          color: "red",
          margin: "10px 5px 10px",
        },
        key: 0,
      },
      []
    ),
    api_element(
      "section",
      {
        styleMap: {
          "--my-color": "blue",
          color: "var(--my-color)",
        },
        key: 1,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
