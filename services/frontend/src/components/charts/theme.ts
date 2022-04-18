import * as colors from "styles/_colors.module.scss";
import * as fonts from "styles/_fonts.module.scss";

// Need to use the parsed sizes (i.e. sizes as numbers instead of px strings) because
// the chart styles won't accept px strings, only numbers.
import {sizes} from "utils/parsedStyles";

// Need the scatter plot dots to be slighter larger than the width of the line chart,
// since they display on top of the line chart for the tooltips.
const lineWidth = 4;
const scatterDotSize = lineWidth + 1;

const theme = {
    area: {
        style: {
            data: {
                fill: colors.colorPrimary500,
                fillOpacity: 0.15,
                stroke: colors.colorPrimary600,
                strokeWidth: lineWidth
            }
        }
    },
    // The 'future' style variant for the Area charts.
    areaFuture: {
        style: {
            data: {
                fill: colors.colorFuture400,
                stroke: colors.colorFuture500,
                strokeDasharray: "10, 5"
            }
        }
    },
    chart: {
        // The default Victory padding is 50. For some reason.
        // Anyhow, anything other than 50 is a modification.
        // In this case, we're increasing the left padding so that the amount
        // labels don't get cut off.
        padding: {
            top: 30,
            bottom: 50,
            left: 80,
            right: 20
        }
    },
    dependentAxis: {
        style: {
            axis: {
                stroke: "transparent"
            },
            grid: {
                stroke: colors.colorNeutral300,
                // Want an extra thin horizontal grid line, since we want the grid lines
                // to just kinda be there in the background. Greatly de-emphasized.
                strokeWidth: 0.5
            },
            tickLabels: {
                fill: colors.colorNeutral600,
                fontFamily: fonts.fontFamilyDefault,
                fontSize: fonts.fontSize100,
                padding: sizes.size300
            }
        }
    },
    independentAxis: {
        style: {
            axis: {
                stroke: "transparent"
            },
            grid: {
                stroke: "transparent"
            },
            tickLabels: {
                fill: colors.colorNeutral600,
                fontFamily: fonts.fontFamilyDefault,
                fontSize: fonts.fontSize100,
                padding: sizes.size400
            }
        }
    },
    scatter: {
        style: {
            data: {
                fill: colors.colorPrimary700
            }
        },
        size: ({active}: {active: boolean}) => (active ? scatterDotSize : 0)
    },
    // The 'future' style variant for the Scatter charts.
    scatterFuture: {
        style: {
            data: {
                fill: colors.colorFuture600
            }
        }
    }
};

export default theme;
