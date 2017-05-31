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
                    $default$: [$cmp.isTrue ? $api.h(
                        "p",
                        {},
                        [$api.t("S1")]
                    ) : null, $api.h(
                        "p",
                        {},
                        [$api.t("S2")]
                    )]
                }
            }
        )]
    )];
}
