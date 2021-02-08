import OpcuaProvider from "./OpcuaProvider";
import MqttProvider from "./MqttProvider";

export const providerList = {
    "opcua": OpcuaProvider,
    "mqtt": MqttProvider
};