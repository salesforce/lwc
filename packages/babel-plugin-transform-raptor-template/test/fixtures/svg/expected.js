const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "svg",
        {
            props: {
                ariaHidden: "true",
                class: "slds-button__icon"
            }
        },
        [$api.h(
            "use",
            {
                props: {
                    "xlink:href": "/s/assets/icons/utility-sprite/svg/symbols.svg#chevrondown"
                }
            },
            []
        )]
    )];
}
export const templateUsedIds = [];
