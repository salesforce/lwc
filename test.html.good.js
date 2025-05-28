const stylesheetScopeToken = "lwc-24o8hkv25p3";
const hasScopedStylesheets = defaultScopedStylesheets !== undefined && defaultScopedStylesheets.length > 0;
import ChildComponentCtor_xAncientOne from "x/ancientOne";
import {SYMBOL__GENERATE_MARKUP as __SYMBOL__GENERATE_MARKUP, fallbackTmplNoYield as __fallbackTmpl, addSlottedContent, renderStylesheets, hasScopedStaticStylesheets} from "@lwc/ssr-runtime";
import ChildComponentCtor_xGreatGrandparent from "x/greatGrandparent";
import ChildComponentCtor_xGrandparent from "x/grandparent";
import ChildComponentCtor_xParent from "x/parent";
import ChildComponentCtor_xChild from "x/child";
import ChildComponentCtor_xGrandchild from "x/grandchild";
import ChildComponentCtor_xZygote from "x/zygote";
import ChildComponentCtor_xNascent from "x/nascent";
import defaultStylesheets from "./test.css";
import defaultScopedStylesheets from "./test.scoped.css?scoped=true";
export default function __lwcTmpl($$emit, shadowSlottedContent, lightSlottedContent, scopedSlottedContent, Cmp, instance) {
  let textContentBuffer = '';
  let didBufferTextContent = false;
  const slotAttributeValue = null;
  const contextfulParent = instance;
  const isLightDom = Cmp.renderMode === 'light';
  if (!isLightDom) {
    $$emit(`<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`);
  }
  const {stylesheets: staticStylesheets} = Cmp;
  if (defaultStylesheets || defaultScopedStylesheets || staticStylesheets) {
    $$emit(renderStylesheets($$emit, defaultStylesheets, defaultScopedStylesheets, staticStylesheets, stylesheetScopeToken, Cmp, hasScopedStylesheets));
  }
  const __lwcGenerateShadowSlottedContent_xNascent_0 = () => function __lwcGenerateShadowSlottedContent_xNascent_0($$emit, contextfulParent) {
    $$emit("<div");
    if (slotAttributeValue) {
      $$emit(` slot="${slotAttributeValue}"`);
    }
    if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
      $$emit(` class="${stylesheetScopeToken}"`);
    }
    {
      const attrName = "id";
      const attrValue = "test";
      const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
      const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
      $$emit(' ' + attrName);
      if (attrValue !== '' || shouldRenderScopeToken) {
        $$emit('="' + attrValue + suffix + '"');
      }
    }
    $$emit("></div>");
  };
  const __lwcGenerateShadowSlottedContent_xZygote_1 = () => function __lwcGenerateShadowSlottedContent_xZygote_1($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {};
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        $$emit("<div");
        if (slotAttributeValue) {
          $$emit(` slot="${slotAttributeValue}"`);
        }
        if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
          $$emit(` class="${stylesheetScopeToken}"`);
        }
        {
          const attrName = "id";
          const attrValue = "test";
          const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
          const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
          $$emit(' ' + attrName);
          if (attrValue !== '' || shouldRenderScopeToken) {
            $$emit('="' + attrValue + suffix + '"');
          }
        }
        $$emit("></div>");
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-nascent";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xGrandchild_2 = () => function __lwcGenerateShadowSlottedContent_xGrandchild_2($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {};
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            $$emit("<div");
            if (slotAttributeValue) {
              $$emit(` slot="${slotAttributeValue}"`);
            }
            if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
              $$emit(` class="${stylesheetScopeToken}"`);
            }
            {
              const attrName = "id";
              const attrValue = "test";
              const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
              const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
              $$emit(' ' + attrName);
              if (attrValue !== '' || shouldRenderScopeToken) {
                $$emit('="' + attrValue + suffix + '"');
              }
            }
            $$emit("></div>");
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-nascent";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-zygote";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xChild_3 = () => function __lwcGenerateShadowSlottedContent_xChild_3($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {
        slot: "childSlot"
      };
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            {
              const childProps = {};
              const childAttrs = {};
              if (slotAttributeValue) {
                childAttrs.slot = slotAttributeValue;
              }
              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
              const lightSlottedContentMap = Object.create(null);;
              const scopedSlottedContentMap = null;;
              addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                $$emit("<div");
                if (slotAttributeValue) {
                  $$emit(` slot="${slotAttributeValue}"`);
                }
                if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                  $$emit(` class="${stylesheetScopeToken}"`);
                }
                {
                  const attrName = "id";
                  const attrValue = "test";
                  const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                  const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                  $$emit(' ' + attrName);
                  if (attrValue !== '' || shouldRenderScopeToken) {
                    $$emit('="' + attrValue + suffix + '"');
                  }
                }
                $$emit("></div>");
              }, lightSlottedContentMap);
              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
              const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
              const tagName = "x-nascent";
              if (generateMarkup) {
                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
              } else {
                $$emit(`<${tagName}>`);
                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                $$emit(`</${tagName}>`);
              }
            }
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-zygote";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-grandchild";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xParent_4 = () => function __lwcGenerateShadowSlottedContent_xParent_4($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {
        slot: "parentSlot"
      };
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xChild_3();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent("childSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            {
              const childProps = {};
              const childAttrs = {};
              if (slotAttributeValue) {
                childAttrs.slot = slotAttributeValue;
              }
              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
              const lightSlottedContentMap = Object.create(null);;
              const scopedSlottedContentMap = null;;
              addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                {
                  const childProps = {};
                  const childAttrs = {};
                  if (slotAttributeValue) {
                    childAttrs.slot = slotAttributeValue;
                  }
                  const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
                  const lightSlottedContentMap = Object.create(null);;
                  const scopedSlottedContentMap = null;;
                  addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                    $$emit("<div");
                    if (slotAttributeValue) {
                      $$emit(` slot="${slotAttributeValue}"`);
                    }
                    if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                      $$emit(` class="${stylesheetScopeToken}"`);
                    }
                    {
                      const attrName = "id";
                      const attrValue = "test";
                      const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                      const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                      $$emit(' ' + attrName);
                      if (attrValue !== '' || shouldRenderScopeToken) {
                        $$emit('="' + attrValue + suffix + '"');
                      }
                    }
                    $$emit("></div>");
                  }, lightSlottedContentMap);
                  const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                  const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
                  const tagName = "x-nascent";
                  if (generateMarkup) {
                    generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                  } else {
                    $$emit(`<${tagName}>`);
                    __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                    $$emit(`</${tagName}>`);
                  }
                }
              }, lightSlottedContentMap);
              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
              const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
              const tagName = "x-zygote";
              if (generateMarkup) {
                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
              } else {
                $$emit(`<${tagName}>`);
                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
                $$emit(`</${tagName}>`);
              }
            }
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-grandchild";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xChild[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-child";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xChild, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xGrandparent_5 = () => function __lwcGenerateShadowSlottedContent_xGrandparent_5($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {
        slot: "grandparentSlot"
      };
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xParent_4();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent("parentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xChild_3();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent("childSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            {
              const childProps = {};
              const childAttrs = {};
              if (slotAttributeValue) {
                childAttrs.slot = slotAttributeValue;
              }
              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
              const lightSlottedContentMap = Object.create(null);;
              const scopedSlottedContentMap = null;;
              addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                {
                  const childProps = {};
                  const childAttrs = {};
                  if (slotAttributeValue) {
                    childAttrs.slot = slotAttributeValue;
                  }
                  const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
                  const lightSlottedContentMap = Object.create(null);;
                  const scopedSlottedContentMap = null;;
                  addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                    {
                      const childProps = {};
                      const childAttrs = {};
                      if (slotAttributeValue) {
                        childAttrs.slot = slotAttributeValue;
                      }
                      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
                      const lightSlottedContentMap = Object.create(null);;
                      const scopedSlottedContentMap = null;;
                      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                        $$emit("<div");
                        if (slotAttributeValue) {
                          $$emit(` slot="${slotAttributeValue}"`);
                        }
                        if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                          $$emit(` class="${stylesheetScopeToken}"`);
                        }
                        {
                          const attrName = "id";
                          const attrValue = "test";
                          const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                          const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                          $$emit(' ' + attrName);
                          if (attrValue !== '' || shouldRenderScopeToken) {
                            $$emit('="' + attrValue + suffix + '"');
                          }
                        }
                        $$emit("></div>");
                      }, lightSlottedContentMap);
                      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                      const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
                      const tagName = "x-nascent";
                      if (generateMarkup) {
                        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                      } else {
                        $$emit(`<${tagName}>`);
                        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                        $$emit(`</${tagName}>`);
                      }
                    }
                  }, lightSlottedContentMap);
                  const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                  const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
                  const tagName = "x-zygote";
                  if (generateMarkup) {
                    generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                  } else {
                    $$emit(`<${tagName}>`);
                    __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
                    $$emit(`</${tagName}>`);
                  }
                }
              }, lightSlottedContentMap);
              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
              const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
              const tagName = "x-grandchild";
              if (generateMarkup) {
                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
              } else {
                $$emit(`<${tagName}>`);
                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
                $$emit(`</${tagName}>`);
              }
            }
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xChild[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-child";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xChild, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xParent[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-parent";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xParent, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xGreatGrandparent_6 = () => function __lwcGenerateShadowSlottedContent_xGreatGrandparent_6($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {};
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandparent_5();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent("grandparentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xParent_4();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent("parentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            {
              const childProps = {};
              const childAttrs = {};
              if (slotAttributeValue) {
                childAttrs.slot = slotAttributeValue;
              }
              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xChild_3();;
              const lightSlottedContentMap = Object.create(null);;
              const scopedSlottedContentMap = null;;
              addSlottedContent("childSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                {
                  const childProps = {};
                  const childAttrs = {};
                  if (slotAttributeValue) {
                    childAttrs.slot = slotAttributeValue;
                  }
                  const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
                  const lightSlottedContentMap = Object.create(null);;
                  const scopedSlottedContentMap = null;;
                  addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                    {
                      const childProps = {};
                      const childAttrs = {};
                      if (slotAttributeValue) {
                        childAttrs.slot = slotAttributeValue;
                      }
                      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
                      const lightSlottedContentMap = Object.create(null);;
                      const scopedSlottedContentMap = null;;
                      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                        {
                          const childProps = {};
                          const childAttrs = {};
                          if (slotAttributeValue) {
                            childAttrs.slot = slotAttributeValue;
                          }
                          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
                          const lightSlottedContentMap = Object.create(null);;
                          const scopedSlottedContentMap = null;;
                          addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                            $$emit("<div");
                            if (slotAttributeValue) {
                              $$emit(` slot="${slotAttributeValue}"`);
                            }
                            if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                              $$emit(` class="${stylesheetScopeToken}"`);
                            }
                            {
                              const attrName = "id";
                              const attrValue = "test";
                              const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                              const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                              $$emit(' ' + attrName);
                              if (attrValue !== '' || shouldRenderScopeToken) {
                                $$emit('="' + attrValue + suffix + '"');
                              }
                            }
                            $$emit("></div>");
                          }, lightSlottedContentMap);
                          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                          const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
                          const tagName = "x-nascent";
                          if (generateMarkup) {
                            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                          } else {
                            $$emit(`<${tagName}>`);
                            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                            $$emit(`</${tagName}>`);
                          }
                        }
                      }, lightSlottedContentMap);
                      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                      const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
                      const tagName = "x-zygote";
                      if (generateMarkup) {
                        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                      } else {
                        $$emit(`<${tagName}>`);
                        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
                        $$emit(`</${tagName}>`);
                      }
                    }
                  }, lightSlottedContentMap);
                  const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                  const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
                  const tagName = "x-grandchild";
                  if (generateMarkup) {
                    generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                  } else {
                    $$emit(`<${tagName}>`);
                    __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
                    $$emit(`</${tagName}>`);
                  }
                }
              }, lightSlottedContentMap);
              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
              const generateMarkup = ChildComponentCtor_xChild[__SYMBOL__GENERATE_MARKUP];
              const tagName = "x-child";
              if (generateMarkup) {
                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
              } else {
                $$emit(`<${tagName}>`);
                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xChild, instance);
                $$emit(`</${tagName}>`);
              }
            }
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xParent[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-parent";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xParent, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xGrandparent[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-grandparent";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandparent, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  const __lwcGenerateShadowSlottedContent_xAncientOne_7 = () => function __lwcGenerateShadowSlottedContent_xAncientOne_7($$emit, contextfulParent) {
    {
      const childProps = {};
      const childAttrs = {};
      if (slotAttributeValue) {
        childAttrs.slot = slotAttributeValue;
      }
      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGreatGrandparent_6();;
      const lightSlottedContentMap = Object.create(null);;
      const scopedSlottedContentMap = null;;
      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
        {
          const childProps = {};
          const childAttrs = {};
          if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
          }
          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandparent_5();;
          const lightSlottedContentMap = Object.create(null);;
          const scopedSlottedContentMap = null;;
          addSlottedContent("grandparentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
            {
              const childProps = {};
              const childAttrs = {};
              if (slotAttributeValue) {
                childAttrs.slot = slotAttributeValue;
              }
              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xParent_4();;
              const lightSlottedContentMap = Object.create(null);;
              const scopedSlottedContentMap = null;;
              addSlottedContent("parentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                {
                  const childProps = {};
                  const childAttrs = {};
                  if (slotAttributeValue) {
                    childAttrs.slot = slotAttributeValue;
                  }
                  const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xChild_3();;
                  const lightSlottedContentMap = Object.create(null);;
                  const scopedSlottedContentMap = null;;
                  addSlottedContent("childSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                    {
                      const childProps = {};
                      const childAttrs = {};
                      if (slotAttributeValue) {
                        childAttrs.slot = slotAttributeValue;
                      }
                      const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
                      const lightSlottedContentMap = Object.create(null);;
                      const scopedSlottedContentMap = null;;
                      addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                        {
                          const childProps = {};
                          const childAttrs = {};
                          if (slotAttributeValue) {
                            childAttrs.slot = slotAttributeValue;
                          }
                          const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
                          const lightSlottedContentMap = Object.create(null);;
                          const scopedSlottedContentMap = null;;
                          addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                            {
                              const childProps = {};
                              const childAttrs = {};
                              if (slotAttributeValue) {
                                childAttrs.slot = slotAttributeValue;
                              }
                              const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
                              const lightSlottedContentMap = Object.create(null);;
                              const scopedSlottedContentMap = null;;
                              addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                                $$emit("<div");
                                if (slotAttributeValue) {
                                  $$emit(` slot="${slotAttributeValue}"`);
                                }
                                if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                                  $$emit(` class="${stylesheetScopeToken}"`);
                                }
                                {
                                  const attrName = "id";
                                  const attrValue = "test";
                                  const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                                  const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                                  $$emit(' ' + attrName);
                                  if (attrValue !== '' || shouldRenderScopeToken) {
                                    $$emit('="' + attrValue + suffix + '"');
                                  }
                                }
                                $$emit("></div>");
                              }, lightSlottedContentMap);
                              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                              const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
                              const tagName = "x-nascent";
                              if (generateMarkup) {
                                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                              } else {
                                $$emit(`<${tagName}>`);
                                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                                $$emit(`</${tagName}>`);
                              }
                            }
                          }, lightSlottedContentMap);
                          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                          const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
                          const tagName = "x-zygote";
                          if (generateMarkup) {
                            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                          } else {
                            $$emit(`<${tagName}>`);
                            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
                            $$emit(`</${tagName}>`);
                          }
                        }
                      }, lightSlottedContentMap);
                      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                      const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
                      const tagName = "x-grandchild";
                      if (generateMarkup) {
                        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                      } else {
                        $$emit(`<${tagName}>`);
                        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
                        $$emit(`</${tagName}>`);
                      }
                    }
                  }, lightSlottedContentMap);
                  const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                  const generateMarkup = ChildComponentCtor_xChild[__SYMBOL__GENERATE_MARKUP];
                  const tagName = "x-child";
                  if (generateMarkup) {
                    generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                  } else {
                    $$emit(`<${tagName}>`);
                    __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xChild, instance);
                    $$emit(`</${tagName}>`);
                  }
                }
              }, lightSlottedContentMap);
              const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
              const generateMarkup = ChildComponentCtor_xParent[__SYMBOL__GENERATE_MARKUP];
              const tagName = "x-parent";
              if (generateMarkup) {
                generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
              } else {
                $$emit(`<${tagName}>`);
                __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xParent, instance);
                $$emit(`</${tagName}>`);
              }
            }
          }, lightSlottedContentMap);
          const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
          const generateMarkup = ChildComponentCtor_xGrandparent[__SYMBOL__GENERATE_MARKUP];
          const tagName = "x-grandparent";
          if (generateMarkup) {
            generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
          } else {
            $$emit(`<${tagName}>`);
            __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandparent, instance);
            $$emit(`</${tagName}>`);
          }
        }
      }, lightSlottedContentMap);
      const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
      const generateMarkup = ChildComponentCtor_xGreatGrandparent[__SYMBOL__GENERATE_MARKUP];
      const tagName = "x-great-grandparent";
      if (generateMarkup) {
        generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
      } else {
        $$emit(`<${tagName}>`);
        __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGreatGrandparent, instance);
        $$emit(`</${tagName}>`);
      }
    }
  };
  {
    const childProps = {};
    const childAttrs = {};
    if (slotAttributeValue) {
      childAttrs.slot = slotAttributeValue;
    }
    const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xAncientOne_7();;
    const lightSlottedContentMap = Object.create(null);;
    const scopedSlottedContentMap = null;;
    addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
      {
        const childProps = {};
        const childAttrs = {};
        if (slotAttributeValue) {
          childAttrs.slot = slotAttributeValue;
        }
        const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGreatGrandparent_6();;
        const lightSlottedContentMap = Object.create(null);;
        const scopedSlottedContentMap = null;;
        addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
          {
            const childProps = {};
            const childAttrs = {};
            if (slotAttributeValue) {
              childAttrs.slot = slotAttributeValue;
            }
            const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandparent_5();;
            const lightSlottedContentMap = Object.create(null);;
            const scopedSlottedContentMap = null;;
            addSlottedContent("grandparentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
              {
                const childProps = {};
                const childAttrs = {};
                if (slotAttributeValue) {
                  childAttrs.slot = slotAttributeValue;
                }
                const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xParent_4();;
                const lightSlottedContentMap = Object.create(null);;
                const scopedSlottedContentMap = null;;
                addSlottedContent("parentSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                  {
                    const childProps = {};
                    const childAttrs = {};
                    if (slotAttributeValue) {
                      childAttrs.slot = slotAttributeValue;
                    }
                    const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xChild_3();;
                    const lightSlottedContentMap = Object.create(null);;
                    const scopedSlottedContentMap = null;;
                    addSlottedContent("childSlot" ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                      {
                        const childProps = {};
                        const childAttrs = {};
                        if (slotAttributeValue) {
                          childAttrs.slot = slotAttributeValue;
                        }
                        const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xGrandchild_2();;
                        const lightSlottedContentMap = Object.create(null);;
                        const scopedSlottedContentMap = null;;
                        addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                          {
                            const childProps = {};
                            const childAttrs = {};
                            if (slotAttributeValue) {
                              childAttrs.slot = slotAttributeValue;
                            }
                            const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xZygote_1();;
                            const lightSlottedContentMap = Object.create(null);;
                            const scopedSlottedContentMap = null;;
                            addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                              {
                                const childProps = {};
                                const childAttrs = {};
                                if (slotAttributeValue) {
                                  childAttrs.slot = slotAttributeValue;
                                }
                                const shadowSlottedContent = __lwcGenerateShadowSlottedContent_xNascent_0();;
                                const lightSlottedContentMap = Object.create(null);;
                                const scopedSlottedContentMap = null;;
                                addSlottedContent(null ?? "", function __lwcGenerateSlottedContent($$emit, contextfulParent, slotAttributeValue) {
                                  $$emit("<div");
                                  if (slotAttributeValue) {
                                    $$emit(` slot="${slotAttributeValue}"`);
                                  }
                                  if (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp)) {
                                    $$emit(` class="${stylesheetScopeToken}"`);
                                  }
                                  {
                                    const attrName = "id";
                                    const attrValue = "test";
                                    const shouldRenderScopeToken = attrName === 'class' && (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
                                    const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
                                    $$emit(' ' + attrName);
                                    if (attrValue !== '' || shouldRenderScopeToken) {
                                      $$emit('="' + attrValue + suffix + '"');
                                    }
                                  }
                                  $$emit("></div>");
                                }, lightSlottedContentMap);
                                const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                                const generateMarkup = ChildComponentCtor_xNascent[__SYMBOL__GENERATE_MARKUP];
                                const tagName = "x-nascent";
                                if (generateMarkup) {
                                  generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                                } else {
                                  $$emit(`<${tagName}>`);
                                  __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xNascent, instance);
                                  $$emit(`</${tagName}>`);
                                }
                              }
                            }, lightSlottedContentMap);
                            const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                            const generateMarkup = ChildComponentCtor_xZygote[__SYMBOL__GENERATE_MARKUP];
                            const tagName = "x-zygote";
                            if (generateMarkup) {
                              generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                            } else {
                              $$emit(`<${tagName}>`);
                              __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xZygote, instance);
                              $$emit(`</${tagName}>`);
                            }
                          }
                        }, lightSlottedContentMap);
                        const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                        const generateMarkup = ChildComponentCtor_xGrandchild[__SYMBOL__GENERATE_MARKUP];
                        const tagName = "x-grandchild";
                        if (generateMarkup) {
                          generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                        } else {
                          $$emit(`<${tagName}>`);
                          __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandchild, instance);
                          $$emit(`</${tagName}>`);
                        }
                      }
                    }, lightSlottedContentMap);
                    const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                    const generateMarkup = ChildComponentCtor_xChild[__SYMBOL__GENERATE_MARKUP];
                    const tagName = "x-child";
                    if (generateMarkup) {
                      generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                    } else {
                      $$emit(`<${tagName}>`);
                      __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xChild, instance);
                      $$emit(`</${tagName}>`);
                    }
                  }
                }, lightSlottedContentMap);
                const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
                const generateMarkup = ChildComponentCtor_xParent[__SYMBOL__GENERATE_MARKUP];
                const tagName = "x-parent";
                if (generateMarkup) {
                  generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
                } else {
                  $$emit(`<${tagName}>`);
                  __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xParent, instance);
                  $$emit(`</${tagName}>`);
                }
              }
            }, lightSlottedContentMap);
            const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
            const generateMarkup = ChildComponentCtor_xGrandparent[__SYMBOL__GENERATE_MARKUP];
            const tagName = "x-grandparent";
            if (generateMarkup) {
              generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
            } else {
              $$emit(`<${tagName}>`);
              __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGrandparent, instance);
              $$emit(`</${tagName}>`);
            }
          }
        }, lightSlottedContentMap);
        const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
        const generateMarkup = ChildComponentCtor_xGreatGrandparent[__SYMBOL__GENERATE_MARKUP];
        const tagName = "x-great-grandparent";
        if (generateMarkup) {
          generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
        } else {
          $$emit(`<${tagName}>`);
          __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xGreatGrandparent, instance);
          $$emit(`</${tagName}>`);
        }
      }
    }, lightSlottedContentMap);
    const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
    const generateMarkup = ChildComponentCtor_xAncientOne[__SYMBOL__GENERATE_MARKUP];
    const tagName = "x-ancient-one";
    if (generateMarkup) {
      generateMarkup($$emit, tagName, childProps, childAttrs, instance, scopeToken, contextfulParent, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap);
    } else {
      $$emit(`<${tagName}>`);
      __fallbackTmpl($$emit, shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ChildComponentCtor_xAncientOne, instance);
      $$emit(`</${tagName}>`);
    }
  }
  if (!isLightDom) {
    $$emit('</template>');
    if (shadowSlottedContent) {
      shadowSlottedContent($$emit, contextfulParent);
    }
  }
  /*LWC compiler v8.19.1*/
}
__lwcTmpl.hasScopedStylesheets = hasScopedStylesheets;
__lwcTmpl.stylesheetScopeToken = stylesheetScopeToken;
