/**
 * cssnano decided to make its APIs async with v4. Because the LWC compiler transform API is
 * synchronous we can't use the cssnano default preset. We now need to keep a list of all the
 * cssnano plugins that can run sync.
 * https://github.com/cssnano/cssnano/blob/master/packages/cssnano-preset-default/src/index.js
 *
 * We may switch back to the preset if cssnano decide to go back to a synchronous API:
 * https://github.com/cssnano/cssnano/issues/68
 */
import cssDeclarationSorter from 'css-declaration-sorter';
import postcssDiscardComments from 'postcss-discard-comments';
import postcssReduceInitial from 'postcss-reduce-initial';
import postcssMinifyGradients from 'postcss-minify-gradients';
import postcssReduceTransforms from 'postcss-reduce-transforms';
import postcssConvertValues from 'postcss-convert-values';
import postcssCalc from 'postcss-calc';
import postcssColormin from 'postcss-colormin';
import postcssOrderedValues from 'postcss-ordered-values';
import postcssMinifySelectors from 'postcss-minify-selectors';
import postcssMinifyParams from 'postcss-minify-params';
import postcssMinifyFontValues from 'postcss-minify-font-values';
import postcssNormalizeUrl from 'postcss-normalize-url';
import postcssMergeLonghand from 'postcss-merge-longhand';
import postcssDiscardDuplicates from 'postcss-discard-duplicates';
import postcssDiscardOverridden from 'postcss-discard-overridden';
import postcssNormalizeRepeatStyle from 'postcss-normalize-repeat-style';
import postcssMergeRules from 'postcss-merge-rules';
import postcssDiscardEmpty from 'postcss-discard-empty';
import postcssUniqueSelectors from 'postcss-unique-selectors';
import postcssNormalizeString from 'postcss-normalize-string';
import postcssNormalizePositions from 'postcss-normalize-positions';
import postcssNormalizeWhitespace from 'postcss-normalize-whitespace';
import postcssNormalizeDisplayValues from 'postcss-normalize-display-values';
import postcssNormalizeTimingFunctions from 'postcss-normalize-timing-functions';
import rawCache from 'cssnano-util-raw-cache';

export default [
    postcssDiscardComments,
    postcssMinifyGradients,
    postcssReduceInitial,
    postcssNormalizeDisplayValues,
    postcssReduceTransforms,
    postcssColormin,
    postcssNormalizeTimingFunctions,
    postcssCalc,
    postcssConvertValues({ length: false }),
    postcssOrderedValues,
    postcssMinifySelectors,
    postcssMinifyParams,
    postcssDiscardOverridden,
    postcssNormalizeString,
    postcssMinifyFontValues,
    postcssNormalizeUrl,
    postcssNormalizeRepeatStyle,
    postcssNormalizePositions,
    postcssNormalizeWhitespace,
    postcssMergeLonghand,
    postcssDiscardDuplicates,
    postcssMergeRules,
    postcssDiscardEmpty,
    postcssUniqueSelectors,
    cssDeclarationSorter({ exclude: true }),
    rawCache,
];
