export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "ul",
        {},
        $api.i($cmp.items, function (item) {
            return $api.h(
                "li",
                {
                    key: item.key
                },
                [item.value]
            );
        })
    )];
}
tmpl.ids = ["items"];
