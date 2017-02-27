const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            props: {
                a: $cmp.foo.c
            }
        },
        [$api.h(
            "p",
            {
                props: {
                    b: $cmp.bar.c
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = ["foo", "bar"];
