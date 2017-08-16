# Internationalization in Raptor Component

## Status

_wip_

## Use Cases

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
