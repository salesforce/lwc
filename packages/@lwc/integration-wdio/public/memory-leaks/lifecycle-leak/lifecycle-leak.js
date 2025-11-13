(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<button class="add-child${0}"${2}>Add child</button>`;
    const $fragment2 = lwc.parseFragment`<button class="remove-children${0}"${2}>Remove children</button>`;
    const stc0 = {
      classMap: {
        "container": true
      },
      ref: "container",
      context: {
        lwc: {
          dom: "manual"
        }
      },
      key: 4
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment, h: api_element} = $api;
      const {_m0, _m1, _m2, _m3} = $ctx;
      return [api_static_fragment($fragment1$1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "click": api_bind($cmp.addChild)
        })
      }, null)]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m3 || ($ctx._m3 = {
          "click": api_bind($cmp.removeChildren)
        })
      }, null)]), api_element("div", stc0)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.hasRefs = true;
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-2r3s41r9i1";
    tmpl$1.legacyStylesheetToken = "integration-lifecycle-leak_lifecycle-leak";
    lwc.freezeTemplate(tmpl$1);

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var shadowSelector = token ? ("[" + token + "]") : "";
      return "h1" + shadowSelector + " {color: red;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets = [stylesheet];

    const $fragment1 = lwc.parseFragment`<h1${3}>hello</h1>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-74484v40a3r";
    tmpl.legacyStylesheetToken = "integration-child_child";
    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    lwc.freezeTemplate(tmpl);

    // This is just so we can find the leaking object later
    class VeryUniqueObjectName {}
    window.VeryUniqueObjectName = VeryUniqueObjectName;
    const __lwc_component_class_internal$1 = lwc.registerComponent(lwc.registerDecorators(class extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._object = new VeryUniqueObjectName();
      }
      /*LWC compiler v8.24.0*/
    }, {
      fields: ["_object"]
    }), {
      tmpl: _tmpl,
      sel: "integration-child",
      apiVersion: 66
    });

    const __lwc_component_class_internal = lwc.registerComponent(class extends lwc.LightningElement {
      addChild() {
        this.refs.container.appendChild(lwc.createElement('integration-child', {
          is: __lwc_component_class_internal$1
        }));
      }
      removeChildren() {
        // Our monkey-patching for synthetic lifecycle events covers removeChild, but not innerHTML = ''
        this.refs.container.innerHTML = '';
      }
      /*LWC compiler v8.24.0*/
    }, {
      tmpl: _tmpl$1,
      sel: "integration-lifecycle-leak",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-lifecycle-leak', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
