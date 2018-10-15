import _nsRow from "ns/row";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    c: api_custom_element,
    i: api_iterator,
    h: api_element
  } = $api;

  return [
    api_element(
      "table",
      {
        key: 2
      },
      [
        api_element(
          "tbody",
          {
            key: 3
          },
          api_iterator($cmp.rows, function(row) {
            return row.visible
              ? api_custom_element(
                  "tr",
                  _nsRow,
                  {
                    attrs: {
                      is: "ns-row"
                    },
                    key: api_key(4, row.id)
                  },
                  []
                )
              : null;
          })
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
