# Internationalization in Lightning Web Component

## Status

_first draft_

## Goal

Provide best-in-class localization infrastructure for Lightning Web Components.

## Use Cases

* As a developer, I can opt-in to localize my template.
* As a developer, I can interpolate text, variables and HTML tags.
* As a developer, I can format number and dates in my template.
* As a developer, I can select from different statements in my template.
* As a developer, I can use grammatically to format nouns based on app configurations.
* As a developer, I can pluralize sentences based on numeric values.

## Proposal 1: Fluent Subset

This proposal is heavily influenced by [Fluent](http://projectfluent.io/) from Mozilla. And introduces a new template directive called `intl` that can be use to specify certain things in the template.

The most basic step is to define the id of the translation bundle by using `<template intl:id="something">`, which means that the `template` can be localized/localized by parsing the HTML, and extracting the labels from it. This signals to the compiler that extra work is required during compilation to extra all the labels and produce a localization bundle per component.

### Template Grammar

The template grammar is following a simplified `Fluent` grammar by adding certain restrictions.

#### Interpolation

Lightning Web Components already support interpolation in the body of the tags by using `{identifier}`, with no spaces, and where the `identifier` must be a JavaScript valid identifier. Additionally, you can reference any property member, e.g.: `{foo.bar}`.

Additionally, interpolation of text and HTML markup is supported. e.g.:

```html
<template intl:id="bundle1">
    <p>Age: <b>{state.userAge}</b></p>
</template>
```

#### Built-in Functions

Like `Fluent`, we want to provide a set of standard built-in functions that can be used as part of the interpolation and value normalization.

* DATETIME(): [Same as in Fluent](http://projectfluent.io/fluent/guide/functions.html#function-parameters)
* NUMBER(): [Same as in Fluent](http://projectfluent.io/fluent/guide/functions.html#function-parameters)
* PLURAL(): LWC specific to support pluralization.
* NOUN(): LWC specific to support labeling.

##### PLURAL() built-in function

Function that receives a number, and produces `"zero"`, `"one"`, `"two"`, `"few"`, `"many"` or `"other"`. Additionally, it supports an argument `type`, which could be `ordinal` or `cardinal` (default value).

```html
PLURAL(value)
PLURAL(value, type: "cardinal")
PLURAL(value, type: "ordinal")
```

##### NOUN() built-in function

Function that receives the name of the noun as a string, and produces the corresponding form based on a set of options.

```
NOUN("Contact")
NOUN("contact")
NOUN("opportunity", plural: "y")
```

The first argument is the name of the noun (will be used as a fallback value). The rest of the arguments are optional `key: value` pairs:

Optional attributes:

 * case: (`n`)moninative | (`a`)ccusative | (`g`)enitive | (`d`)ative | (`o`)bjective | (`s`)ubjective - default is `n`
 * plural: (`y`)es | (`n`)o - default is `n`
 * article: (`n`)one | (`a`) | (`the`) | (`d`)efinite | (`i`)ndefinite  - default is `n`

Note: if no attributes specified, the default value is equivalent to:

```html
NOUN("opportunity", case: "n", plural: "n", article: "n")
```

E.g.:

```html
<template intl:id="bundle2">
    ...
    <p>Allows collection of {NOUN("chatter")} and {NOUN("networks")} metrics</p>
    ...
    <label>Enable announcements in {NOUN("Chatter")}</label>
    ...
    <p>You need to specify {NOUN("contact"), article: "a")} on {NOUN("case", article: "the")} first.</p>
</template>
```

#### Selection

This is the more generic form of logic in a template, equivalent to switch in JavaScript where the value `state.usergender` is going to be matched against the 3 provided options:

```html
<template intl:id="bundle3">
    <p>{state.userName} liked your comment on {state.usergender ->
        [male] his
        [female] her
       *[other] their
    } post.
    </p>
</template>
```

The option marked with `*` is the default. Also note that the example is using interpolation in combination with the selection mechanism, so a segment of the overall text will be driven by the value of `state.usergender`.

#### Pluralization

The pluralization is just a more specific selection mechanism by using the `PLURAL()` built-in function to transform a numeric value to match one of the following values: `"zero"`, `"one"`, `"two"`, `"few"`, `"many"` or `"other"`. The rest is just the regular selection mechanism.

```html
<template intl:id="bundle4">
    <p>{PLURAL(state.photos.length) ->
        [zero] User hasn't added any photos yet
        [one] User added a new photo
        *[other] User added {NUMBER(state.photos.length)} new photos
    </p>
</template>
```

#### Attributes

This proposal does not include any advanced option for HTML attributes. Which means that built-in functions and advanced interpolation are not possible for HTML attribute. However, it does exact certain elements and attributes that are allowed for localization. E.g.:

```html
<template intl:id="bundle5">
    <button title="click here to show more details" class="big">
        details
    </button>
</template>
```

In the example above, the `title` of the `<button>` and the text, can be localized, while the `class` attribute should not.

For custom elements, since we do not know what is localizable or not, the developer can signal it by using the `intl` directive:

```html
<template intl:id="bundle6">
    <fancy-button class="big" intl:tooltip="click here to show more details">
        details
    </fancy-button>
</template>
```

In the example above, even though the compiler does not know what `tooltip` attributes is, it will extract it for localization because it is marked with the `intl:` directive.

### Lightning Web Components vs Fluent

As we mentioned above, Lightning Web Components template uses a more restrictive grammar, where:

* no spaces can be used between `{` and `}` and the identifier.
* no `$` is needed before identifiers to reference local variables.
* no sections
* no tags (for now)
* no comments (for now)
* no variants (for now)



## Annexes

### Examples

#### just a label

> 1. `"Expand"`
> 2. `"What I Follow"`

#### label with token replacement

> 1. `"W-4157973 — John Smith to GUS Only"`

where `"W-4157973"` and `"John Smith"` are computed values.

#### label with pluralization rules

> 1. `"240 Members"`

where `"members"` is pluralized depending on the numeric value.

#### label with genre select rules

> 1. `"Kimberly Lee, Vinit Bhandari, and 12 others like this."`

where the number of users have to be separated, counted, and the offset for the numeric value of `"12"` have to be formatted, and `"others"` must be pluralized.

#### label with number (ordinals)

> 1. `"Popular group: 3,078 members"`
> 2. `"240 Members"`

where `"3,078"` is a formatted number, and `"members"` is pluralized.

#### label with currency

TBD

#### label with date-time

> 1. `"Last Modified By UserAgile Health, 8/16/2017 1:00 AM"`

#### label with relative time

> 1. `"Joined in the last month"`

where `"last month"` is a relative time formatted value

> 2. `"50+ items • Updated a few seconds ago"`

where `"a few seconds ago"` is a relative time formatted value, and `"50+ items"` is a number formatted value with pluralization.

#### label with dynamic entities

> 1. `"You need to specify a contact on the case first."`

where `"a contact"` is an entitity (`<contact article="a"/>`) and `"the case"` is an entitye as well (`<case article="the"/>`).

#### label with embeded HTML (including attributes)

> 1. `"<strong>Note:</strong> See Merge Fields Below"`

where `"<strong>Note:</strong>"` is a markup segment, and only `"Note:"` should be localized.

> 2. `"In the <a href="/item/number/123">example below</a>, "Sir or Madam" will be substituted if the lead doesn't have a first name."`

where `"/item/number/123"` is a computed value, and all other visible text should be localized.
