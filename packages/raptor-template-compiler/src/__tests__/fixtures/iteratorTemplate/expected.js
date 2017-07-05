export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (xValue, xIndex, xFirst, xLast) {
            return $api.h(
                "div",
                {
                    attrs: {
                        'data-islast': xLast,
                        'data-isfirst': xFirst
                    }
                },
                [
                    $api.h(
                        "span",
                        {},
                        [
                            $api.t("Row: "),
                            $api.d(xIndex)
                        ]
                    ),
                    $api.t(". Value: "),
                    $api.d(xValue)
                ]
            );
        })
    )];
}
