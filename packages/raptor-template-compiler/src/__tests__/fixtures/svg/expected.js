export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "svg",
        {
            classMap: {
                "slds-button__icon": true
            },
            attrs: {
                viewBox: "0 0 5 5",
                "aria-hidden": "true"
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
