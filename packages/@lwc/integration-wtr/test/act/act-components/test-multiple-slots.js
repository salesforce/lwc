/* eslint-disable */
export default function (define) {
    return define(
        'records/recordLayout2',
        ['force/foo', 'ui/something', 'ui/another', 'lwc'],
        function (_forceFoo, _uiSomething, _uiAnother, lwc) {
            function _interopDefaultLegacy(e) {
                return e && typeof e === 'object' && 'default' in e ? e : { default: e };
            }
            var _forceFoo__default = /*#__PURE__*/ _interopDefaultLegacy(_forceFoo);
            var _uiSomething__default = /*#__PURE__*/ _interopDefaultLegacy(_uiSomething);
            var _uiAnother__default = /*#__PURE__*/ _interopDefaultLegacy(_uiAnother);
            function tmpl($api, $cmp, $slotset, $ctx) {
                const { c: api_custom_element } = $api;
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
                            api_custom_element(
                                'ui-something',
                                _uiSomething__default['default'],
                                {
                                    slotAssignment: 'first',
                                    props: {
                                        text: 'Hello',
                                    },
                                    key: 2,
                                },
                                []
                            ),
                            api_custom_element(
                                'ui-another',
                                _uiAnother__default['default'],
                                {
                                    slotAssignment: 'second',
                                    props: {
                                        value: 'Foo',
                                    },
                                    key: 3,
                                },
                                []
                            ),
                        ]
                    ),
                ];
            }

            lwc.registerTemplate(tmpl);
            tmpl.stylesheets = [];
            tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
            lwc.freezeTemplate(tmpl);
            return tmpl;
        }
    );
}
