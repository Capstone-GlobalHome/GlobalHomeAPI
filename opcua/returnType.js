
const opcua = require("node-opcua");
export const returnType = {
    "boolean": opcua.DataType.Boolean,
    "double": opcua.DataType.Double,
    "float": opcua.DataType.Float,
    "string": opcua.DataType.String,
};