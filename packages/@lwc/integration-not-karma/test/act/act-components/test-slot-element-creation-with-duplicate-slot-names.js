/* eslint-disable */
export default function (define) {
    return define(
        'records/recordLayout2',
        ['force/foo', 'ui/something', 'ui/somethingElse', 'lwc'],
        function (_forceFoo, _uiSomething, _uiSomethingElse, lwc) {
            function _interopDefaultLegacy(e) {
                return e && typeof e === 'object' && 'default' in e ? e : { default: e };
            }
            var _forceFoo__default = /*#__PURE__*/ _interopDefaultLegacy(_forceFoo);
            var _uiSomething__default = /*#__PURE__*/ _interopDefaultLegacy(_uiSomething);
            var _uiSomethingElse__default = /*#__PURE__*/ _interopDefaultLegacy(_uiSomethingElse);
            function tmpl($api, $cmp, $slotset, $ctx) {
                const { c: api_custom_element, s: api_slot } = $api;
                return [
                    api_custom_element(
                        'force-foo',
                        _forceFoo__default['default'],
                        {
                            props: {
                                name: 'Elizabeth Shaw',
                            },
                            key: 1,
                        },
                        [
                            api_slot(
                                'first',
                                {
                                    attrs: {
                                        name: 'first',
                                    },
                                    key: 2,
                                },
                                [
                                    api_custom_element(
                                        'ui-something',
                                        _uiSomething__default['default'],
                                        {
                                            key: 3,
                                        },
                                        []
                                    ),
                                ],
                                $slotset
                            ),
                            api_slot(
                                'first',
                                {
                                    attrs: {
                                        name: 'first',
                                    },
                                    key: 4,
                                },
                                [
                                    api_custom_element(
                                        'ui-something-else',
                                        _uiSomethingElse__default['default'],
                                        {
                                            key: 5,
                                        },
                                        []
                                    ),
                                ],
                                $slotset
                            ),
                        ]
                    ),
                ];
            }

            lwc.registerTemplate(tmpl);
            tmpl.slots = ['first'];
            tmpl.stylesheets = [];
            tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
            lwc.freezeTemplate(tmpl);
            return tmpl;
        }
    );
}
