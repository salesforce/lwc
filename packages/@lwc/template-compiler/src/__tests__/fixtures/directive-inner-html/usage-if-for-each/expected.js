import _aB from "a/b";
import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    s2: true,
  },
  key: 0,
};
const stc1 = {
  lwc: {
    dom: "manual",
  },
};
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    shc: api_sanitize_html_content,
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
      stc0,
      api_flatten([
        $cmp.isTrue
          ? api_element(
              "div",
              {
                props: {
                  innerHTML:
                    $ctx._rawHtml$0 !== ($ctx._rawHtml$0 = $cmp.ifRawHtml)
                      ? ($ctx._sanitizedHtml$0 = api_sanitize_html_content(
                          $cmp.ifRawHtml
                        ))
                      : $ctx._sanitizedHtml$0,
                },
                context: stc1,
                key: 1,
              },
              stc2
            )
          : null,
        api_iterator($cmp.items, function (item) {
          return api_element(
            "div",
            {
              props: {
                innerHTML:
                  $ctx._rawHtml$1 !== ($ctx._rawHtml$1 = item.forRawHtml)
                    ? ($ctx._sanitizedHtml$1 = api_sanitize_html_content(
                        item.forRawHtml
                      ))
                    : $ctx._sanitizedHtml$1,
              },
              context: stc1,
              key: api_key(2, item.id),
            },
            stc2
          );
        }),
      ])
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
