const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {
                attrs: {
                    title: "x",
                    "aria-hidden": "x"
                }
            },
            ["x"]
        )]
    )];
}
export const templateUsedIds = [];
