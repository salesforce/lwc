export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        $api.f([$api.h(
            "p",
            {},
            ["Sibling"]
        ), $slotset.$default$ || [$api.h(
            "p",
            {},
            ["Default slot content"]
        )]])
    )];
}
tmpl.slots = ["$default$"];
