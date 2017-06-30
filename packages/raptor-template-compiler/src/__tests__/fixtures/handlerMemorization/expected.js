export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [
        $api.h("button", {
            on: {
                click: $ctx._m0 || ($ctx._m0 = $api.b($cmp.create))
            }
        }, [
            $api.t("New")
        ]),
        $api.h("ul", {}, $api.i($cmp.list, function(task) {
            return $api.h("li", {}, [
                $api.d(task.title),
                $api.h("button", {
                    on: {
                        click: $api.b(task.delete)
                    }
                }, [
                    $api.t("[X]")
                ])
            ]);
        }))
    ];
}
