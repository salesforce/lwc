import _nsCmp from "ns:cmp";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const _expr = $cmp.isTrue || undefined;

    const m = $cmp[memoized] || ($cmp[memoized] = {});
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
export const templateUsedIds = ["isTrue"];
