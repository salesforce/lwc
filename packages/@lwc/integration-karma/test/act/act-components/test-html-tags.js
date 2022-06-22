/* eslint-disable */
export default function (define) {
    return define('records/recordLayout2', ['html/tags', 'lwc'], function (_htmlTags, lwc) {
        function _interopDefaultLegacy(e) {
            return e && typeof e === 'object' && 'default' in e ? e : { default: e };
        }
        var _htmlTags__default = /*#__PURE__*/ _interopDefaultLegacy(_htmlTags);
        function tmpl($api, $cmp, $slotset, $ctx) {
            const { h: api_element, t: api_text, c: api_custom_element } = $api;
            return [
                api_custom_element(
                    'html-tags',
                    _htmlTags__default['default'],
                    {
                        key: 1,
                    },
                    [
                        api_element(
                            'span',
                            {
                                styleDecls: [['color', 'blue', false]],
                                classMap: {
                                    class1: true,
                                },
                                key: 2,
                            },
                            []
                        ),
                        api_element(
                            'div',
                            {
                                attrs: {
                                    title: 'test',
                                },
                                key: 3,
                            },
                            [
                                api_element(
                                    'h1',
                                    {
                                        key: 4,
                                    },
                                    []
                                ),
                            ]
                        ),
                        api_element(
                            'img',
                            {
                                attrs: {
                                    src: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
                                    alt: 'Smiley face',
                                    height: '42',
                                },
                                key: 5,
                            },
                            []
                        ),
                        api_text('</img>'),
                    ]
                ),
            ];
        }

        lwc.registerTemplate(tmpl);
        tmpl.stylesheets = [];
        tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
        lwc.freezeTemplate(tmpl);
        return tmpl;
    });
}
