export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [_expr && $api.f(
        [$api.t("Outer"), $api.i($cmp.items, function (item) {
            return $api.h(
                "p",
                {},
                [$api.t("Inner")]
            );
        })]
    )];
}
tmpl.ids = ["isTrue", "items"];
