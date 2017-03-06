const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$api.h(
            "p",
            null,
            ["1"]
        ), $cmp.bar ? [$api.h(
            "p",
            null,
            ["2"]
        )] : $api.e(), $api.h(
            "p",
            null,
            ["3"]
        )])
    )];
}
export const templateUsedIds = ["bar"];
