import _nsCmp from "ns-cmp";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.c(
            "ns-cmp",
            _nsCmp,
            {
                slotset: {
                    $default$: [$api.h(
                        "p",
                        {},
                        ["S3"]
                    )]
                }
            }
        )]
    )];
}
export const templateUsedIds = [];
