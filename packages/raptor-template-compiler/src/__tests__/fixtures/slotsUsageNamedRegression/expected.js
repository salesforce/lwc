export default function tmpl($api, $cmp, $slotset, $ctx) {
    return (
        $slotset['secret-slot'] || [
            $api.h('p', {}, [$api.t('Test slot content')])
        ]
    );
}
tmpl.slots = ['secret-slot'];
