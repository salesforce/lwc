import _nsCmp from "ns-cmp";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.c(
            "ns-cmp",
            _nsCmp,
            {
                slotset: {
                    foo: [$api.h(
                        "p",
                        {},
                        ["S3"]
                    )]
                }
            }
        )]
    )];
}
