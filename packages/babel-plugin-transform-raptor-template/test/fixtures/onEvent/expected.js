export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "div",
            {
                on: {
                    click: $ctx._m || ($ctx._m = $api.b($cmp.handleClick))
                }
            },
            [$api.t("x")]
        ), $api.h(
            "div",
            {
                on: {
                    press: $ctx._m2 || ($ctx._m2 = $api.b($cmp.handlePress))
                }
            },
            [$api.t("x")]
        )]
    )];
}
tmpl.ids = ["handleClick", "handlePress"];
