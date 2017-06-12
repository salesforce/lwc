export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item) {
            return $api.h(
                "div",
                {
                    classMap: {
                        "my-list": true
                    }
                },
                [$api.h(
                    "p",
                    {},
                    [$api.d(item)]
                ), $api.h(
                    "p",
                    {},
                    [$api.d($cmp.item2)]
                )]
            );
        })
    )];
}
