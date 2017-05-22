export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "p",
                {},
                [$api.t("1"), item]
            );
        })
    )];
}
tmpl.ids = ["items"];
