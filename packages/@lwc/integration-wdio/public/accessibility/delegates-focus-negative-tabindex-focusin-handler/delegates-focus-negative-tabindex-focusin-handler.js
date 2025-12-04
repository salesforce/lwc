(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input type="text" class="focusable-input${0}"${2}>`;
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
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<div class="focus-in-called${0}"${2}>Focus in called</div>`;
    const stc0 = {
      "tabIndex": "-1"
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, c: api_custom_element, st: api_static_fragment} = $api;
      const {_m0} = $ctx;
      return [api_custom_element("integration-child", __lwc_component_class_internal$1, {
        props: stc0,
        key: 0,
        on: _m0 || ($ctx._m0 = {
          "focusin": api_bind($cmp.handleFocusIn)
        })
      }), $cmp.focusInCalled ? api_static_fragment($fragment1, 2) : null];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-6q5uj5a9kgi";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-negative-tabindex-focusin-handler_delegates-focus-negative-tabindex-focusin-handler";
    lwc.freezeTemplate(tmpl);

    class Test extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.focusInCalled = false;
      }
      handleFocusIn() {
        this.focusInCalled = true;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Test, {
      track: {
        focusInCalled: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(Test, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-negative-tabindex-focusin-handler",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-negative-tabindex-focusin-handler', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
