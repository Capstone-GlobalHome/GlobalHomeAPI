export const SENSOR_RANGES = {
    "SENSOR_CO2": {
        "0-1000": "GOOD",
        "1001-5000": "POOR",
        "5001-40000": "WARNINGS",
        "400001-Infinity": "DANGER"
    },
    "SENSOR_VOC": {
        "0-300": "LOW",
        "301-500": "ACCEPTABLE",
        "501-1000": "MARGINAL",
        "10001-Infinity": "HIGH"
    },
    "SENSOR_HUMIDITY": {
        "0-30": "DRY",
        "31-60": "IDEAL",
        "61-100": "HIGH"
    }
}