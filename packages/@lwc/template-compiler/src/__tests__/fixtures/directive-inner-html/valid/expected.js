import { registerTemplate, sanitizeHtmlContent } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        props: {
          innerHTML:
            $ctx._sanitizedHtml$0 ||
            ($ctx._sanitizedHtml$0 = sanitizeHtmlContent(
              "Hello <b>world</b>!"
            )),
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
          innerHTML:
            $ctx._rawHtml$1 !== ($ctx._rawHtml$1 = $cmp.greeting)
              ? ($ctx._sanitizedHtml$1 = sanitizeHtmlContent($cmp.greeting))
              : $ctx._sanitizedHtml$1,
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
