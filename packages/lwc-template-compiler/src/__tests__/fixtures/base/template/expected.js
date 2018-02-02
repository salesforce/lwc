export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'p',
            {
                key: 1
            },
            [
                api_text('Root')
            ]
        )];
}
