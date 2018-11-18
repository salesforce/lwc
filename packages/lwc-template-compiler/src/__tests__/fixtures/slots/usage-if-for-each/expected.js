import _aB from "a/b";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
    c: api_custom_element
  } = $api;

  return [
    api_custom_element(
      "a-b",
      _aB,
      {
        classMap: {
          s2: true
        },
        key: 2
      },
      $cmp.isTrue
        ? api_iterator($cmp.items, function(item) {
            return api_element(
              "p",
              {
                key: api_key(5, item.id)
              },
              [api_text("X")]
            );
          })
        : []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
