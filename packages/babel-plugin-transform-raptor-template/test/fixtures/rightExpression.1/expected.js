const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {
                className: $cmp.bar.foo
            },
            []
        )]
    )];
}
export const templateUsedIds = ["bar"];
