import _nsRow from "ns-row";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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
                ) : undefined;
            })
        )]
    )];
}
tmpl.ids = ["rows"];
