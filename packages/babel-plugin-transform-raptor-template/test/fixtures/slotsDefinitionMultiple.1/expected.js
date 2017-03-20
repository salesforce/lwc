const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
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
export const templateUsedIds = [];
