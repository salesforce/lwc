import _xFoo from 'x-foo';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { s: api_slot, c: api_custom_element } = $api;

    return [
        api_custom_element(
            'x-foo',
            _xFoo,
            {
                key: 2
            },
            [
                api_slot(
                    '',
                    {
                        key: 1
                    },
                    [],
                    $slotset
                )
            ]
        )
    ];
}
tmpl.slots = [''];
