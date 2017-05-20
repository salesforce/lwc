export default function tmpl($api, $cmp, $slotset, $ctx) {
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
