export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                {},
                ["1", item]
            ), $api.h(
                "p",
                {},
                ["2", item.foo]
            ), $api.h(
                "p",
                {},
                ["3", $cmp.other]
            ), $api.h(
                "p",
                {},
                ["4", $cmp.other.foo]
            )];
        })
    )];
}
tmpl.ids = ["items", "other"];
