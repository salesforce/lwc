const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            className: $cmp.foo.c
        },
        [$api.h(
            "p",
            {
                className: $cmp.bar.c
            },
            []
        )]
    )];
}
export const templateUsedIds = ["foo", "bar"];
