const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$api.h(
            "p",
            null,
            ["Before header"]
        ), $slotset.header || ["Default header"], $api.h(
            "p",
            null,
            ["In"]
        ), $api.h(
            "p",
            null,
            ["between"]
        ), $slotset.$default$ || [$api.h(
            "p",
            null,
            ["Default body"]
        )], $slotset.footer || [$api.h(
            "p",
            null,
            ["Default footer"]
        )]])
    )];
}
export const templateUsedIds = [];
