
const opcua = require("node-opcua");
export const returnType = {
    "boolean": opcua.DataType.Boolean,
    "double": opcua.DataType.Double,
    "float": opcua.DataType.Float,
    "string": opcua.DataType.String,
    "uint32": opcua.DataType.UInt32,
    "uint16": opcua.DataType.UInt16,
};
