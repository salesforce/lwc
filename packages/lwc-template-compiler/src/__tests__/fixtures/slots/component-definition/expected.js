import _xFoo from 'x-foo';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element, c: api_custom_element } = $api;

    return [
        api_custom_element(
            'x-foo',
            _xFoo,
            {
                key: 2
            },
            [
                api_element(
                    'slot',
                    {
                        key: 1
                    },
                    []
                )
            ]
        )
    ];
}
tmpl.slots = [''];
