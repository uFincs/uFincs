# Cross Slice Selectors

A cross slice selector is just that - a selector that is composed of multiple selectors from multiple different slices.

Originally, all of these cross slice selectors were stored in a single file. However, as the number grew, the file grew more unwieldy.

As such, it was decided that they had to be split apart to better organize them. The only question was _how_ to split them apart.

Ultimately, it was decided that they would be split apart and grouped by the type of value that was being selected. As such, a selector that returned a set of transactions that was maybe derived using all of the raw transaction data along with all of the raw account data would be grouped under 'transaction' cross slice selectors.

Ultimately, _how the selector is used_ is what really determines its grouping.

## Note on Cross Slice Selector Interdependencies

Due to the nature of how some of the cross slice selectors work, it's gonna happen that cross slice selectors will refer to each other. Ideally not cyclically, but if they cylical, then it should only be at the file level -- two cross slice selectors obviously shouldn't depend on each other.
