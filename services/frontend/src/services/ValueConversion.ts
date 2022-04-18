export default class ValueConversion {
    static convertDollarsToCents(dollars: string | number): number {
        return Math.round(parseFloat(dollars.toString()) * 100);
    }

    static convertCentsToDollars(cents: number): number {
        return cents / 100;
    }

    static convertPercentToMillipercents(percent: string | number): number {
        return Math.round(parseFloat(percent.toString()) * 1000);
    }

    static convertMillipercentsToPercent(milliPercents: number): number {
        return milliPercents / 1000;
    }

    static parsePixels(pixels: string) {
        return pixels ? parseInt(pixels.split("px")[0]) : 0;
    }

    static parseMilliseconds(milliseconds: string) {
        return milliseconds ? parseInt(milliseconds.split("ms")[0]) : 0;
    }
}
