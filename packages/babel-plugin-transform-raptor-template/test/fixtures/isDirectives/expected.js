import _nsRow from "ns-row";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "table",
        {},
        [$api.h(
            "tbody",
            {},
            $api.i($cmp.rows, function (row) {
                return row.visible ? $api.c(
                    "tr",
                    _nsRow,
                    {
                        attrs: {
                            is: "ns-row"
                        }
                    }
                ) : $api.e();
            })
        )]
    )];
}
export const templateUsedIds = ["rows"];
