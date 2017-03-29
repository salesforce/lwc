export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "svg",
        {
            attrs: {
                "aria-hidden": "true"
            },
            classMap: {
                "slds-button__icon": true
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
