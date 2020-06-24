import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    h: api_element,
    k: api_key,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 6,
      },
      api_iterator($cmp.items, function (xValue, xIndex, xFirst, xLast) {
        return api_element(
          "div",
          {
            attrs: {
              "data-islast": xLast,
              "data-isfirst": xFirst,
            },
            key: api_key(5, xValue.id),
          },
          [
            api_element(
              "span",
              {
                key: 2,
              },
              [api_text("Row: ", 0), api_dynamic(xIndex, 1)]
            ),
            api_text(". Value: ", 3),
            api_dynamic(xValue, 4),
          ]
        );
      })
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
