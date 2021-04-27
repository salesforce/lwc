import { registerTemplate, sanitizeHtmlContent } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        props: {
          innerHTML: sanitizeHtmlContent("Hello <b>world</b>!"),
        },
        context: {
          lwc: {
            dom: "manual",
          },
        },
        key: 0,
      },
      []
    ),
    api_element(
      "div",
      {
        props: {
          innerHTML: sanitizeHtmlContent($cmp.greeting),
        },
        context: {
          lwc: {
            dom: "manual",
          },
        },
        key: 1,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
