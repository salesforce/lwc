import _nsCmp from "ns:cmp";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        [$api.c(
            "ns-cmp",
            _nsCmp,
            {
                slotset: {
                    foo: [$api.h(
                        "p",
                        null,
                        ["S3"]
                    )]
                }
            }
        )]
    )];
}
export const templateUsedIds = [];
