import _nsCmp from "ns-cmp";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [$api.h(
        "section",
        {},
        [$api.c(
            "ns-cmp",
            _nsCmp,
            {
                slotset: {
                    $default$: [_expr && $api.h(
                        "p",
                        {},
                        ["S1"]
                    ), $api.h(
                        "p",
                        {},
                        ["S2"]
                    )]
                }
            }
        )]
    )];
}
tmpl.ids = ["isTrue"];
