const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "svg",
        {
            attrs: {
                ariaHidden: "true"
            },
            class: "slds-button__icon"
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
