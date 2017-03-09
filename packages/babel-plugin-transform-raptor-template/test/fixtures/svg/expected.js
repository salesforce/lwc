const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "svg",
        {
            attrs: {
                "aria-hidden": "true"
            },
            props: {
                className: "slds-button__icon"
            }
        },
        [$api.h(
            "use",
            {
                attrs: {
                    "xlink:href": "/x"
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = [];
