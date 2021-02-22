import _aB from "a/b";
import { registerTemplate, sanitizeHtmlContent } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    k: api_key,
    i: api_iterator,
    f: api_flatten,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "a-b",
      _aB,
      {
        classMap: {
          s2: true,
        },
        key: 0,
      },
      api_flatten([
        $cmp.isTrue
          ? api_element(
              "div",
              {
                props: {
                  innerHTML:
                    $ctx._rawHtml$0 !== ($ctx._rawHtml$0 = $cmp.ifRawHtml)
                      ? ($ctx._sanitizedHtml$0 = sanitizeHtmlContent(
                          $cmp.ifRawHtml
                        ))
                      : $ctx._sanitizedHtml$0,
                },
                context: {
                  lwc: {
                    dom: "manual",
                  },
                },
                key: 1,
              },
              []
            )
          : null,
        api_iterator($cmp.items, function (item) {
          return api_element(
            "div",
            {
              props: {
                innerHTML:
                  $ctx._rawHtml$1 !== ($ctx._rawHtml$1 = item.forRawHtml)
                    ? ($ctx._sanitizedHtml$1 = sanitizeHtmlContent(
                        item.forRawHtml
                      ))
                    : $ctx._sanitizedHtml$1,
              },
              context: {
                lwc: {
                  dom: "manual",
                },
              },
              key: api_key(2, item.id),
            },
            []
          );
        }),
      ])
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
