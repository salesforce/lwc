import { IRuleMetadata, Rules, RuleFailure, RuleWalker, Utils } from 'tslint';
import { ClassDeclaration, HeritageClause, SourceFile } from 'typescript';

/*
Whenever we extend a global native constructor that is of type "object" in
IE11 (e.g., NodeList, HTMLCollection, etc), this results in compiled code
that throws in IE11 because the compiled code (rightly) expects that the
constructor is of type "function". We decided not to use the obvious
workaround of prototypal inheritance because we want the type-checking we get
from using "extends".

https://github.com/babel/babel/blob/0514a9f90370b2c14bcd722f96fd97644024f9fd/packages/babel-helpers/src/helpers.js#L506
*/

// These global identifiers were taken from:
// https://github.com/sindresorhus/globals/blob/3341b4df701c0f7911bfb2c8064b2bb5d11d6f6a/globals.json
//
// The following filters were applied:
// - Begins with an uppercase letter
// - Typeof "object" in IE11
// - Typeof "function" in Chrome
const ILLEGAL_IDENTIFIER_SET = new Set([
    'AnimationEvent',
    'Attr',
    'BeforeUnloadEvent',
    'CSSFontFaceRule',
    'CSSImportRule',
    'CSSKeyframeRule',
    'CSSKeyframesRule',
    'CSSMediaRule',
    'CSSNamespaceRule',
    'CSSPageRule',
    'CSSRule',
    'CSSRuleList',
    'CSSStyleDeclaration',
    'CSSStyleRule',
    'CSSStyleSheet',
    'CanvasGradient',
    'CanvasPattern',
    'CanvasRenderingContext2D',
    'CharacterData',
    'CloseEvent',
    'Comment',
    'CompositionEvent',
    'Crypto',
    'CustomEvent',
    'DOMError',
    'DOMException',
    'DOMImplementation',
    'DOMStringList',
    'DOMStringMap',
    'DOMTokenList',
    'DataTransfer',
    'DeviceMotionEvent',
    'DeviceOrientationEvent',
    'Document',
    'DocumentFragment',
    'DocumentType',
    'DragEvent',
    'Element',
    'ErrorEvent',
    'Event',
    'File',
    'FileList',
    'FocusEvent',
    'HTMLAllCollection',
    'HTMLAnchorElement',
    'HTMLAreaElement',
    'HTMLAudioElement',
    'HTMLBRElement',
    'HTMLBaseElement',
    'HTMLBodyElement',
    'HTMLButtonElement',
    'HTMLCanvasElement',
    'HTMLCollection',
    'HTMLDListElement',
    'HTMLDataListElement',
    'HTMLDirectoryElement',
    'HTMLDivElement',
    'HTMLDocument',
    'HTMLElement',
    'HTMLEmbedElement',
    'HTMLFieldSetElement',
    'HTMLFontElement',
    'HTMLFormElement',
    'HTMLFrameElement',
    'HTMLFrameSetElement',
    'HTMLHRElement',
    'HTMLHeadElement',
    'HTMLHeadingElement',
    'HTMLHtmlElement',
    'HTMLIFrameElement',
    'HTMLImageElement',
    'HTMLInputElement',
    'HTMLLIElement',
    'HTMLLabelElement',
    'HTMLLegendElement',
    'HTMLLinkElement',
    'HTMLMapElement',
    'HTMLMarqueeElement',
    'HTMLMediaElement',
    'HTMLMenuElement',
    'HTMLMetaElement',
    'HTMLModElement',
    'HTMLOListElement',
    'HTMLObjectElement',
    'HTMLOptGroupElement',
    'HTMLOptionElement',
    'HTMLParagraphElement',
    'HTMLParamElement',
    'HTMLPreElement',
    'HTMLProgressElement',
    'HTMLQuoteElement',
    'HTMLScriptElement',
    'HTMLSelectElement',
    'HTMLSourceElement',
    'HTMLSpanElement',
    'HTMLStyleElement',
    'HTMLTableCaptionElement',
    'HTMLTableCellElement',
    'HTMLTableColElement',
    'HTMLTableElement',
    'HTMLTableRowElement',
    'HTMLTableSectionElement',
    'HTMLTextAreaElement',
    'HTMLTitleElement',
    'HTMLTrackElement',
    'HTMLUListElement',
    'HTMLUnknownElement',
    'HTMLVideoElement',
    'History',
    'IDBCursor',
    'IDBCursorWithValue',
    'IDBDatabase',
    'IDBFactory',
    'IDBIndex',
    'IDBKeyRange',
    'IDBObjectStore',
    'IDBOpenDBRequest',
    'IDBRequest',
    'IDBTransaction',
    'IDBVersionChangeEvent',
    'ImageData',
    'KeyboardEvent',
    'Location',
    'MediaError',
    'MediaList',
    'MediaQueryList',
    'MessageEvent',
    'MessagePort',
    'MimeType',
    'MimeTypeArray',
    'MouseEvent',
    'MutationEvent',
    'MutationRecord',
    'NamedNodeMap',
    'Navigator',
    'Node',
    'NodeFilter',
    'NodeIterator',
    'NodeList',
    'PageTransitionEvent',
    'Performance',
    'PerformanceEntry',
    'PerformanceMark',
    'PerformanceMeasure',
    'PerformanceNavigation',
    'PerformanceNavigationTiming',
    'PerformanceResourceTiming',
    'PerformanceTiming',
    'Plugin',
    'PluginArray',
    'PointerEvent',
    'PopStateEvent',
    'ProcessingInstruction',
    'ProgressEvent',
    'Range',
    'SVGAElement',
    'SVGAngle',
    'SVGAnimatedAngle',
    'SVGAnimatedBoolean',
    'SVGAnimatedEnumeration',
    'SVGAnimatedInteger',
    'SVGAnimatedLength',
    'SVGAnimatedLengthList',
    'SVGAnimatedNumber',
    'SVGAnimatedNumberList',
    'SVGAnimatedPreserveAspectRatio',
    'SVGAnimatedRect',
    'SVGAnimatedString',
    'SVGAnimatedTransformList',
    'SVGCircleElement',
    'SVGClipPathElement',
    'SVGComponentTransferFunctionElement',
    'SVGDefsElement',
    'SVGDescElement',
    'SVGElement',
    'SVGEllipseElement',
    'SVGFEBlendElement',
    'SVGFEColorMatrixElement',
    'SVGFEComponentTransferElement',
    'SVGFECompositeElement',
    'SVGFEConvolveMatrixElement',
    'SVGFEDiffuseLightingElement',
    'SVGFEDisplacementMapElement',
    'SVGFEDistantLightElement',
    'SVGFEFloodElement',
    'SVGFEFuncAElement',
    'SVGFEFuncBElement',
    'SVGFEFuncGElement',
    'SVGFEFuncRElement',
    'SVGFEGaussianBlurElement',
    'SVGFEImageElement',
    'SVGFEMergeElement',
    'SVGFEMergeNodeElement',
    'SVGFEMorphologyElement',
    'SVGFEOffsetElement',
    'SVGFEPointLightElement',
    'SVGFESpecularLightingElement',
    'SVGFESpotLightElement',
    'SVGFETileElement',
    'SVGFETurbulenceElement',
    'SVGFilterElement',
    'SVGGElement',
    'SVGGradientElement',
    'SVGImageElement',
    'SVGLength',
    'SVGLengthList',
    'SVGLineElement',
    'SVGLinearGradientElement',
    'SVGMarkerElement',
    'SVGMaskElement',
    'SVGMatrix',
    'SVGMetadataElement',
    'SVGNumber',
    'SVGNumberList',
    'SVGPathElement',
    'SVGPatternElement',
    'SVGPoint',
    'SVGPointList',
    'SVGPolygonElement',
    'SVGPolylineElement',
    'SVGPreserveAspectRatio',
    'SVGRadialGradientElement',
    'SVGRect',
    'SVGRectElement',
    'SVGSVGElement',
    'SVGScriptElement',
    'SVGStopElement',
    'SVGStringList',
    'SVGStyleElement',
    'SVGSwitchElement',
    'SVGSymbolElement',
    'SVGTSpanElement',
    'SVGTextContentElement',
    'SVGTextElement',
    'SVGTextPathElement',
    'SVGTextPositioningElement',
    'SVGTitleElement',
    'SVGTransform',
    'SVGTransformList',
    'SVGUnitTypes',
    'SVGUseElement',
    'SVGViewElement',
    'Screen',
    'Selection',
    'SourceBuffer',
    'SourceBufferList',
    'Storage',
    'StorageEvent',
    'StyleSheet',
    'StyleSheetList',
    'SubtleCrypto',
    'Text',
    'TextEvent',
    'TextMetrics',
    'TextTrack',
    'TextTrackCueList',
    'TextTrackList',
    'TimeRanges',
    'TrackEvent',
    'TransitionEvent',
    'TreeWalker',
    'UIEvent',
    'URL',
    'ValidityState',
    'WebGLActiveInfo',
    'WebGLBuffer',
    'WebGLFramebuffer',
    'WebGLProgram',
    'WebGLRenderbuffer',
    'WebGLRenderingContext',
    'WebGLShader',
    'WebGLShaderPrecisionFormat',
    'WebGLTexture',
    'WebGLUniformLocation',
    'WheelEvent',
    'Window',
    'XMLDocument',
    'XMLHttpRequestEventTarget',
]);

export class Rule extends Rules.AbstractRule {
    public static metadata: IRuleMetadata = {
        ruleName: 'no-extend-ie-object-rule',
        description: 'Avoids directly extending global constructors.',
        descriptionDetails:
            'In IE11, some global constructors are type `object`, and this causes the code generated by @babel/plugin-transform-classes to throw.',
        rationale: Utils.dedent`
            We wanted to continue extending global constructors like NodeList
            and HTMLCollection instead of moving to prototypal inheritance
            for the type-checking benefits.
        `,
        hasFix: false,
        type: 'functionality',
        options: {},
        optionsDescription: 'No options.',
        typescriptOnly: false,
    };

    public apply(sourceFile: SourceFile): RuleFailure[] {
        return this.applyWithWalker(new NoExtendIEObject(sourceFile, this.getOptions()));
    }
}

class NoExtendIEObject extends RuleWalker {
    public visitClassDeclaration(node: ClassDeclaration) {
        if (node.heritageClauses) {
            node.heritageClauses.forEach(this.visitHeritageClause.bind(this));
        }
    }
    visitHeritageClause(node: HeritageClause) {
        const text = node.getText();
        // The AST doesn't seem to provide a way to differentiate between an
        // "extends" clause and an "implements" clause...
        if (/^extends/.test(text)) {
            if (node.types) {
                const type = node.types[0];
                const id = type.expression.getText();
                if (ILLEGAL_IDENTIFIER_SET.has(id)) {
                    this.addFailureAtNode(
                        node,
                        `Directly extending the "${id}" global constructor causes an error to be thrown in IE11. Use prototypal inheritance instead. :sadtrombone:`
                    );
                }
            }
        }
    }
}
