
import ThingsMappingRepo from '../repo/things_mapping_repo'

import { returnType } from "../opcua/returnType";

import OpcuaSessionHelper from '../opcua/opcua_session'
const opcuaSessionHelper = new OpcuaSessionHelper();
import {
    AttributeIds,
    StatusCodes,
} from "node-opcua";


class OpcuaProvider {



    async execute(getThingType, res) {

        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            let index = getThingType.index;
            const executeCommand = this.buildOpcuaCommand(thingsIotmappingConfig, index);
            console.log("cmd", executeCommand);
            thingsIotmappingConfig.argValue = getThingType.argValue;
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig, executeCommand, serverUrl)
        } else {
            res.status(404).json({
                status: "error",
                message: "Things mapping configuration not found.",
                statusCode: 404
            });
        }
        // const read = await opcuaSessionHelper.readNode(endPointUrl);
        // const write = await opcuaSessionHelper.writeToNode(endPointUrl);
    }

    async read(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            let index = getThingType.index;
            const executeCommand = this.buildOpcuaCommand(thingsIotmappingConfig, index);
            console.log("cmd", executeCommand);
            return await this.buildOpcuaReadCommand(executeCommand, serverUrl)
        } else {
            return undefined;
        }

        // const read = await opcuaSessionHelper.readNode(endPointUrl);
        // const write = await opcuaSessionHelper.writeToNode(endPointUrl);
    }


    buildOpcuaCommand(config, index) {
        let ns = config.name_space;
        let exe_cmd = config.executing_command;
        let cmd = ns + ';' + exe_cmd.replace('index', index);
        return cmd;
    }

    async buildOpcuaExecutionCommand(config, cmd, serverUrl) {
        const client = await opcuaSessionHelper.getOpcuaClient()
        const session = await opcuaSessionHelper.getOPcuaSession(client, serverUrl);
        var status_code = await session.writeSingleNode(cmd, this.buildWriteValueObject(config.argument_type,
            config.argValue));
        await session.close();
        await client.disconnect();
        console.log('writeOPCUACommands status_code =', status_code);
    }
    async buildOpcuaReadCommand(cmd, serverUrl) {
        const client = await opcuaSessionHelper.getOpcuaClient()
        const session = await opcuaSessionHelper.getOPcuaSession(client, serverUrl);
        const exeCmd = cmd.toString();
        const nodeId = "ns=13;s=GVL.astDALIFixture[0].bSetLevel"
        const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
        await session.close();
        await client.disconnect();
        console.log("dataValue", dataValue);
        if (dataValue.value.value !== null) {
            return dataValue.value;
        } else {
            return undefined;
        }
    }

    buildWriteValueObject(type, value) {
        let writeValue = { "dataType": returnType[type], "value": value }
        console.log("writevalue", writeValue);
        return writeValue;
    }

    async getstate() {
        // getting mapping from things-mapping-config
        // call to things_temp_value table for stub api call.
        const client = opcuaSessionHelper.getOpcuaClient()
        const session = opcuaSessionHelper.getOPcuaSession(client);
        const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
        if (dataValue.statusCode !== StatusCodes.Good) {
            console.log("Could not read ", nodeId);
        }
        console.log(` temperature = ${dataValue.value.toString()}`);
    }
}
export default OpcuaProvider