(function (lwc) {
  'use strict';

  function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
    var shadowSelector = token ? ("." + token) : "";
    return "div" + shadowSelector + " {color: blue;}";
    /*LWC compiler vX.X.X*/
  }
  stylesheet.$scoped$ = true;
  var _implicitScopedStylesheets = [stylesheet];

  const {h: api_element, so: api_set_owner} = lwc.renderApi;
  const $hoisted1 = api_element("div", {
    key: 0,
    "isStatic": true
  }, []);
  function tmpl($api, $cmp, $slotset, $ctx) {
    return [api_set_owner($hoisted1)];
    /*LWC compiler vX.X.X*/
  }
  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];
  if (_implicitScopedStylesheets) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
  }
  if (_implicitScopedStylesheets) {
    tmpl.stylesheetToken = "x-app_app";
  }

  class App extends lwc.LightningElement {
    /*LWC compiler vX.X.X*/
  }

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  const container = document.getElementById('main');
  const element = lwc.createElement('x-app', {
    is: App$1
  });
  container.appendChild(element);

})(LWC);
