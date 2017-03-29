export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        $api.f([$slotset.other || [$api.h(
            "p",
            {},
            ["Default slot other content"]
        )], $slotset.$default$ || [$api.h(
            "p",
            {},
            ["Default slot content"]
        )]])
    )];
}
tmpl.slots = ["other", "$default$"];
