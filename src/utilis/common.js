import { Validator } from 'node-input-validator';
import _ from "lodash";
export const Common = {
    inRange: (value, range) => {
        let rangeValues = range.split("-");
        let min = rangeValues[0];
        let max = rangeValues[1];
        return ((value - min) * (value - max) <= 0);
    }
}
export const validate = (requestBody, validation) => {
    const feilds = Object.assign({}, validation);
    return new Validator(requestBody, feilds);
}
export const raiseValidationError = (validationStatus, res) => {
    const errors = _.map(validationStatus.errors, value => value.message);
    res.status(422).json({
        statusCode: 422,
        status: "error",
        message: errors,
        data: null
    })
}