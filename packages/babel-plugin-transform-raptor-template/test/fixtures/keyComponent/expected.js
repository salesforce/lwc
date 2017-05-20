import _nsItem from "ns-item";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "ul",
        {},
        $api.i($cmp.items, function (item) {
            return $api.c(
                "ns-item",
                _nsItem,
                {
                    key: item.key,
                    slotset: {
                        $default$: [item.value]
                    }
                }
            );
        })
    )];
}
tmpl.ids = ["items"];
