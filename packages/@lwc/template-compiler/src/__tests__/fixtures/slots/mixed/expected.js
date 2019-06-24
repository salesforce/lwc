import _xB from "x/b";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    t: api_text,
    i: api_iterator,
    f: api_flatten,
    c: api_custom_element
  } = $api;
  return [
    api_element(
      "div",
      {
        key: 3
      },
      [
        api_custom_element(
          "x-b",
          _xB,
          {
            key: 2
          },
          api_flatten([
            $cmp.isLoading
              ? api_element(
                  "div",
                  {
                    key: 1
                  },
                  []
                )
              : null,
            $cmp.haveLoadedItems
              ? api_iterator($cmp.menuItems, function(item) {
                  return api_text("x");
                })
              : []
          ])
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
