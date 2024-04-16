import _xRow from "x/row";
import _xTable from "x/table";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>${"t1"}</span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "x-table",
      _xTable,
      {
        props: {
          data: $cmp.data,
        },
        key: 0,
      },
      [
        api_scoped_slot_factory("", function (row, key) {
          return api_fragment(
            key,
            [
              api_custom_element(
                "x-row",
                _xRow,
                {
                  props: {
                    row: row,
                  },
                  key: 1,
                },
                [
                  api_scoped_slot_factory("", function (column, key) {
                    return api_fragment(
                      key,
                      [
                        api_static_fragment($fragment1, 3, [
                          api_static_part(
                            1,
                            null,
                            "Coordinates: " +
                              api_dynamic_text(row.number) +
                              " - " +
                              api_dynamic_text(column.number) +
                              " "
                          ),
                        ]),
                      ],
                      0
                    );
                  }),
                ]
              ),
            ],
            0
          );
        }),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
