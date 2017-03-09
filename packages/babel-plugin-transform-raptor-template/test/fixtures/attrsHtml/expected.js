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
                    title: "x"
                },
                attrs: {
                    "aria-hidden": "foo"
                }
            },
            ["X"]
        )]
    )];
}
export const templateUsedIds = [];
