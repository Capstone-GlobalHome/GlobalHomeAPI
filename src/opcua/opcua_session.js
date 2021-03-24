import {
    resolveNodeId,
    AttributeIds,
    OPCUAClient,
    DataValue,
    BrowseResult,
    ReferenceDescription,
    TimestampsToReturn,
    StatusCode,
    StatusCodes,
    DataType
} from "node-opcua";

class OpcuaSessionHelper {

    async getOPcuaSession(client, endPointUrl) {
        try {
            // currently default end point url is below will be replace by dynamic url
            console.log(" connecting to ", endPointUrl);
            await client.connect(endPointUrl);
            console.log(" connected to ", endPointUrl);
            const session = await client.createSession();
            console.log(" session created".yellow);
            return session;
        } catch (err) {
            await session.close();
            await client.disconnect();
            console.log("Done");
        }

    }
    async getOpcuaClient() {

        try {
            const client = OPCUAClient.create({
                endpoint_must_exist: false,
                connectionStrategy: {
                    maxRetry: 3,
                    initialDelay: 2000,
                    maxDelay: 10 * 1000
                }
            });
            client.on("backoff", (retry, delay) => {
                console.log("Retrying to connect to server attempt ", retry);
            });
            return client;
        } catch (err) {
            console.log("Error" + err.message);
            await client.disconnect();
        }

    }

    async writeToNode(endpointUrl, cmd, valueToNode) {

        try {
            const client = OPCUAClient.create({
                endpoint_must_exist: false,
                connectionStrategy: {
                    maxRetry: 3,
                    initialDelay: 2000,
                    maxDelay: 10 * 1000
                }
            });
            client.on("backoff", (retry, delay) => {
                console.log("Retrying to connect to ", endpointUrl, " attempt ", retry);
            });

            await client.connect(endpointUrl);

            const session = await client.createSession();

            // const cmd = "ns=13;s=GVL.astSMIBlind[1].lrSetPosition";
            var status_code = await session.writeSingleNode(cmd, valueToNode);
            console.log("Execution Response",cmd,status_code);
            await session.close();
            await client.disconnect();
            return status_code;
        }
        catch (err) {
            console.log("Error !!!", err);
        }
    }
    async readNode(endpointUrl, nodeId) {

        try {
            const client = OPCUAClient.create({
                endpoint_must_exist: false,
                connectionStrategy: {
                    maxRetry: 2,
                    initialDelay: 2000,
                    maxDelay: 10 * 1000
                }
            });
            client.on("backoff", (retry, delay) => {
                console.log("Retrying to connect to ", endpointUrl, " attempt ", retry);
            });

            await client.connect(endpointUrl);

            const session = await client.createSession();

            const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
            if (dataValue.statusCode !== StatusCodes.Good) {
                console.log("Could not read ", nodeId);
            }
            console.log(` Getting data for Read operation  = ${dataValue.value.toString()}`);
            await session.close();
            await client.disconnect();
            return dataValue;
        }
        catch (err) {
            console.log("Error !!!", err);
        }
    }
}

export default OpcuaSessionHelper
