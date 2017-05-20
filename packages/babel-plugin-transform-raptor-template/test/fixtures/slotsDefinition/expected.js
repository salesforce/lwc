export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $slotset.$default$ || [$api.h(
            "p",
            {},
            ["Default slot content"]
        )]
    )];
}
tmpl.slots = ["$default$"];
