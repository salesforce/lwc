(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input class="child-input${0}" placeholder="child-input"${2}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input class="first${0}" placeholder="first"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="last${0}" placeholder="last"${2}>`;
    const stc0 = {
      props: {
        "tabIndex": "0"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-child", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-39u38ft66e5";
    tmpl.legacyStylesheetToken = "integration-noop-when-already-focused_noop-when-already-focused";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Container.delegatesFocus = true;
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-noop-when-already-focused",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-noop-when-already-focused', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
