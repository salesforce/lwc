const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {
                props: {
                    foo: $cmp.bar.foo
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = ["bar"];
