import _aB from "a-b";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.c(
        "a-b",
        _aB,
        {
            classMap: {
                s2: true
            },
            slotset: {
                $default$: $cmp.isTrue ? $api.i(
                    $cmp.items,
                    function (item) {
                        return $api.h(
                            "p",
                            {},
                            [$api.t("X")]
                        );
                    }
                ) : []
            }
        }
    )];
}
