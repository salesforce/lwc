export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [$api.h(
        "section",
        {
            classMap: {
                s1: true
            }
        },
        $api.f([$api.t("Other Child"), $api.i($cmp.items, function (item) {
            return $api.t("X");
        }), $api.h(
            "p",
            {},
            [$api.t("Last child")]
        )])
    ), $api.h(
        "section",
        {
            classMap: {
                s2: true
            }
        },
        $api.f([$api.t("Other Child"), _expr && $api.i(
            $cmp.items,
            function (item) {
                return [$api.h(
                    "p",
                    {},
                    [$api.t("X1")]
                ), $api.h(
                    "p",
                    {},
                    [$api.t("X2")]
                )];
            }
        )])
    ), $api.h(
        "section",
        {
            classMap: {
                s3: true
            }
        },
        $api.f([$api.h(
            "p",
            {},
            [$api.t("Last child")]
        ), $api.i($cmp.items, function (item) {
            return $api.h(
                "div",
                {},
                []
            );
        })])
    ), $api.h(
        "section",
        {
            classMap: {
                s4: true
            }
        },
        [$api.h(
            "p",
            {},
            [$api.t("Other child1")]
        ), $api.h(
            "p",
            {},
            [$api.t("Other child2")]
        )]
    )];
}
tmpl.ids = ["items", "isTrue"];
