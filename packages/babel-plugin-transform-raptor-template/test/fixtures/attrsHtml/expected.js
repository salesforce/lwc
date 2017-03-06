const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        [$api.h(
            "p",
            {
                attrs: {
                    title: "x",
                    "aria-hidden": "foo"
                }
            },
            ["X"]
        )]
    )];
}
export const templateUsedIds = [];
