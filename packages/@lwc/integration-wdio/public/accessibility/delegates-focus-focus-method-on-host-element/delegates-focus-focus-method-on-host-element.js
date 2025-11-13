(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<button${3}>click me</button>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-4e6h83g9ann";
    tmpl$1.legacyStylesheetToken = "integration-button_button";
    lwc.freezeTemplate(tmpl$1);

    class Button extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Button.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(Button, {
      tmpl: _tmpl$1,
      sel: "integration-button",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input${3}>`;
    const stc0 = {
      classMap: {
        "negative": true
      },
      props: {
        "tabIndex": "-1"
      },
      key: 2
    };
    const stc1 = {
      classMap: {
        "zero": true
      },
      props: {
        "tabIndex": "0"
      },
      key: 3
    };
    const stc2 = {
      classMap: {
        "none": true
      },
      key: 4
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-button", __lwc_component_class_internal$1, stc0), api_custom_element("integration-button", __lwc_component_class_internal$1, stc1), api_custom_element("integration-button", __lwc_component_class_internal$1, stc2)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-5kge7039l66";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-focus-method-on-host-element_delegates-focus-focus-method-on-host-element";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-focus-method-on-host-element",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-focus-method-on-host-element', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
