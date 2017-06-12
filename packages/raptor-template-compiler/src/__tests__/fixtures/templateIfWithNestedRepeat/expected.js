export default function tmpl($api, $cmp, $slotset, $ctx) {
    return ($cmp.isTrue ? $api.f(
        [$api.t("Outer"), $api.i($cmp.items, function (item) {
            return $api.h(
                "p",
                {},
                [$api.t("Inner")]
            );
        })]
    ) : [] );
}
