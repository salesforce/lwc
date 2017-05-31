export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "div",
            {
                on: {
                    click: $ctx._m0 || ($ctx._m0 = $api.b($cmp.handleClick))
                }
            },
            [$api.t("x")]
        ), $api.h(
            "div",
            {
                on: {
                    press: $ctx._m1 || ($ctx._m1 = $api.b($cmp.handlePress))
                }
            },
            [$api.t("x")]
        )]
    )];
}
