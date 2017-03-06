const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        $api.f([$api.h(
            "p",
            {},
            ["1"]
        ), $cmp.bar ? [$api.h(
            "p",
            {},
            ["2"]
        )] : $api.e(), $api.h(
            "p",
            {},
            ["3"]
        )])
    )];
}
export const templateUsedIds = ["bar"];
