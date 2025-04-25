import React from "react";
import {VictoryLabel, VictoryTooltip} from "victory";
import {borders, fontWeights, sizes} from "utils/parsedStyles";
import {colors, fonts} from "utils/styles";

export default class Tooltip extends React.Component {
    // I don't know why defaultEvents isn't registered on the type, but according to:
    // https://formidable.com/open-source/victory/guides/tooltips/#wrapping-victorytooltip
    // it should be there.
    // @ts-ignore
    static defaultEvents = VictoryTooltip.defaultEvents;

    render() {
        return (
            <VictoryTooltip
                {...this.props}
                // I don't know if this actually does anything for us, but we want
                // it turned on regardless.
                constrainToVisibleArea={true}
                cornerRadius={borders.radiusNormal}
                // Because the pointer length is 0, we need to move the tooltip up,
                // otherwise it renders on the line of the chart.
                dy={-sizes.size400}
                pointerLength={0}
                // Need more top padding than bottom to account for the fact that
                // the Date (first line) has a larger line height.
                flyoutPadding={{
                    top: sizes.size300,
                    bottom: sizes.size100,
                    right: sizes.size400,
                    left: sizes.size400
                }}
                // Note: The 'flyout' is the container of the tooltip.
                // Whereas the 'labelComponent' (defined below) is the content of the tooltip.
                flyoutStyle={{
                    border: "none",
                    fill: colors.colorBackgroundDark,
                    stroke: "transparent"
                }}
                labelComponent={
                    <VictoryLabel
                        // First line = date, make it taller to space it further
                        // from the second line = balance.
                        lineHeight={[2, 1]}
                        // Style is an array, where first element is for first line,
                        // second element is for second line.
                        style={[
                            {
                                fill: colors.colorNeutral400,
                                fontFamily: fonts.fontFamilyDefault,
                                fontSize: fonts.fontSize200
                            },
                            {
                                fill: colors.colorLight,
                                fontFamily: fonts.fontFamilyDefault,
                                fontWeight: fontWeights.bold,
                                fontSize: fonts.fontSize300
                            }
                        ]}
                    />
                }
            />
        );
    }
}
