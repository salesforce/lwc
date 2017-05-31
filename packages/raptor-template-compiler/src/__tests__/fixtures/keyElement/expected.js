export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "ul",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "li",
                {
                    key: item.key
                },
                [$api.d(item.value)]
            );
        })
    )];
}
