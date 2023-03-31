import _xRow from "x/row";
import _xTable from "x/table";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
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
                        api_element("span", stc0, [
                          api_text(
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
