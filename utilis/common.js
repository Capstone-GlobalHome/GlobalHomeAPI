export const Common = {
    inRange: (value, range) => {
        let rangeValues = range.split("-");
        let min = rangeValues[0];
        let max = rangeValues[1];
        return ((value - min) * (value - max) <= 0);
    }
}