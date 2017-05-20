export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$api.h(
            "p",
            {},
            ["Before header"]
        ), $slotset.header || ["Default header"], $api.h(
            "p",
            {},
            ["In"]
        ), $api.h(
            "p",
            {},
            ["between"]
        ), $slotset.$default$ || [$api.h(
            "p",
            {},
            ["Default body"]
        )], $slotset.footer || [$api.h(
            "p",
            {},
            ["Default footer"]
        )]])
    )];
}
tmpl.slots = ["header", "$default$", "footer"];
