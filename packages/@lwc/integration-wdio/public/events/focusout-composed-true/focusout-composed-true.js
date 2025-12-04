(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<input type="text"${3}>`;
    const $fragment2 = lwc.parseFragment`<input class="custom-focus-out${0}" type="text"${2}>`;
    const $fragment3 = lwc.parseFragment`<button${3}>Trigger custom focusout</button>`;
    const $fragment4 = lwc.parseFragment`<div class="focus-out-composed${0}"${2}>Focus Out Composed</div>`;
    const $fragment5 = lwc.parseFragment`<div class="custom-focus-out-not-composed${0}"${2}>Custom Focus Out Not Composed</div>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1, _m2, _m3, _m4, _m5} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focusout": api_bind($cmp.handleFocusOut)
        })
      }, null)]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m3 || ($ctx._m3 = {
          "focusout": api_bind($cmp.handleCustomFocusOut)
        })
      }, null)]), api_static_fragment($fragment3, 5, [api_static_part(0, {
        on: _m5 || ($ctx._m5 = {
          "click": api_bind($cmp.handleButtonClick)
        })
      }, null)]), $cmp.eventIsComposed ? api_static_fragment($fragment4, 7) : null, $cmp.customEventNotComposed ? api_static_fragment($fragment5, 9) : null];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-2ker76horvd";
    tmpl.legacyStylesheetToken = "integration-focusout-composed-true_focusout-composed-true";
    lwc.freezeTemplate(tmpl);

    class FocusOutComposedTrue extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.eventIsComposed = false;
        this.customEventNotComposed = false;
      }
      // Receives native focusout event
      handleFocusOut(evt) {
        this.eventIsComposed = evt.composed;
      }

      // Receives custom native focusout event
      handleCustomFocusOut(evt) {
        this.customEventNotComposed = evt.composed === false;
      }
      handleButtonClick() {
        this.template.querySelector('.custom-focus-out').dispatchEvent(new CustomEvent('focusout', {
          bubbles: true,
          composed: false
        }));
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(FocusOutComposedTrue, {
      track: {
        eventIsComposed: 1,
        customEventNotComposed: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(FocusOutComposedTrue, {
      tmpl: _tmpl,
      sel: "integration-focusout-composed-true",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-focusout-composed-true', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
