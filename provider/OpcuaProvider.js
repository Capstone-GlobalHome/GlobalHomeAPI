
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

    }


    buildOpcuaCommand(config, index) {
        let ns = config.name_space;
        let exe_cmd = config.executing_command;
        let cmd = ns + ';' + exe_cmd.replace('index', index);
        return cmd;
    }

    async buildOpcuaExecutionCommand(config, cmd, serverUrl) {
        // const client = await opcuaSessionHelper.getOpcuaClient()
        // const session = await opcuaSessionHelper.getOPcuaSession(client, serverUrl);
        // const status_code = await session.writeSingleNode(cmd, this.buildWriteValueObject(config.argument_type,
        //     config.argValue));
        const status_code = await opcuaSessionHelper.writeToNode(serverUrl, cmd, this.buildWriteValueObject(config.argument_type,
            config.argValue));
        // await session.close();
        // await client.disconnect();
        console.log('writeOPCUACommands status_code =', status_code);
        let obj = { "value": status_code.value, "description": status_code.description, "name:": status_code.name }
        return obj;
    }

    async buildOpcuaReadCommand(cmd, serverUrl) {
        console.log("cmd", cmd);
        let nodeId = "ns=13;s=GVL.astDALIFixture[0].lrLevel"
        const dataValue = await opcuaSessionHelper.readNode(serverUrl, cmd);
        console.log("dataValue", dataValue);
        if (dataValue.value.value !== null) {
            return dataValue.value;
        } else {
            return dataValue;
        }
    }

    buildWriteValueObject(type, value) {
        let writeValue = { "dataType": returnType[type], "value": value }
        return writeValue;
    }

    // async buildtestExecutionCommand(config, cmd, serverUrl) {
    //     // const client = await opcuaSessionHelper.getOpcuaClient()
    //     // const session = await opcuaSessionHelper.getOPcuaSession(client, serverUrl);
    //     // var status_code = await opcuaSessionHelper.writeSingleNode(cmd, this.buildWriteValueObject(config.argument_type,
    //     //     config.argValue));
    //     const status_code = await opcuaSessionHelper.writeToNode(serverUrl, cmd, this.buildWriteValueObject(config.argument_type,
    //         config.argValue));

    //     // await session.close();
    //     // await client.disconnect();
    //     // console.log('writeOPCUACommands status_code =', status_code);
    // }

    async tstCmd(getThingType) {
        let serverUrl = getThingType.serverUrl;
        let executeCommand = getThingType.command;
        const readWrite = getThingType.operation

        console.log("Operation", readWrite);
        if (readWrite == "R") {
            console.log("OperationR", readWrite);
            const data = await this.buildOpcuaReadCommand(executeCommand, serverUrl)
            return data;
        } else {
            console.log("OperationW", readWrite);
            let dataType = getThingType.dataType
            let argValue = getThingType.argValue;
            let config = {
                "argument_type": dataType,
                "argValue": argValue
            }
            const data = await opcuaSessionHelper.writeToNode(serverUrl, executeCommand, this.buildWriteValueObject(config.argument_type,
                config.argValue));
            // const data = await this.buildOpcuaExecutionCommand(config, executeCommand, serverUrl)
            return data;
        }

    }

}
export default OpcuaProvider