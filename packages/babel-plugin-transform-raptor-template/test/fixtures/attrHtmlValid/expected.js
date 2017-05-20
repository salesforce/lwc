export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "textarea",
            {
                attrs: {
                    minlength: "1",
                    maxlength: "5"
                }
            },
            ["x"]
        )]
    )];
}
