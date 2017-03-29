import _nsCmp from "ns-cmp";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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
