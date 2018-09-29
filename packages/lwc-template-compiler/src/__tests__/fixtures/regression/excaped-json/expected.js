import _xTest from 'x/test';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element } = $api;

    return [
        api_custom_element('x-test', _xTest, {
            props: {
                json:
                    '[{"column":"ID","value":"5e","operator":"equals","f":true}]'
            },
            key: 1
        }, [])
    ];
}
