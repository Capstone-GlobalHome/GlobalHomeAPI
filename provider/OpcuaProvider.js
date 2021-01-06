
import ThingsMappingRepo from '../repo/things_mapping_repo'

import { returnType } from "../opcua/returnType";

import OpcuaSessionHelper from '../opcua/opcua_session'
const opcuaSessionHelper = new OpcuaSessionHelper();

const opcua = require("node-opcua");

class OpcuaProvider {

    async execute(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            let index = getThingType.index;
            const executeCommand = this.buildOpcuaCommand(thingsIotmappingConfig, index);
            console.log("cmd", executeCommand);
            thingsIotmappingConfig.argValue = getThingType.argValue;
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig, executeCommand, serverUrl, false)
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
    buildOpcuaCommandWithoutIndex(config) {
        let ns = config.name_space;
        let exe_cmd = config.executing_command;
        let cmd = ns + ';' + exe_cmd;
        return cmd;
    }

    async buildOpcuaExecutionCommand(config, cmd, serverUrl, isArrayType) {
        // const client = await opcuaSessionHelper.getOpcuaClient()
        // const session = await opcuaSessionHelper.getOPcuaSession(client, serverUrl);
        // const status_code = await session.writeSingleNode(cmd, this.buildWriteValueObject(config.argument_type,
        //     config.argValue));
        const status_code = await opcuaSessionHelper.writeToNode(serverUrl, cmd, this.buildWriteValueObject(config.argument_type,
            config.argValue, isArrayType));
        let obj = { "value": status_code.value, "description": status_code.description, "name:": status_code.name }
        return obj;
    }

    async buildOpcuaReadCommand(cmd, serverUrl) {
        console.log("cmd", cmd);
        const dataValue = await opcuaSessionHelper.readNode(serverUrl, cmd);
        console.log("dataValue", dataValue);
        if (dataValue.value.value !== null) {
            return dataValue.value;
        } else {
            return dataValue;
        }
    }

    buildWriteValueObject(type, value, isArray) {
        let writeValue;
        if (!isArray) {
            writeValue = { "dataType": returnType[type], arrayType: opcua.VariantArrayType.Scalar, "value": value }
        } else {
            writeValue = { "dataType": returnType[type], arrayType: opcua.VariantArrayType.Array, "value": value }
        }
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
                config.argValue, false));
            return data;
        }

    }

    async executeBlindsCommand(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            let index = getThingType.index;

            // Lets execute motor off before making write function to blinds
            const executeCmdForMotorOff = this.buildOpcuaCommand({
                name_space: "ns=13",
                executing_command: "s=GVL.astSMIDevice[index].bSetPosition"
            }, index);
            console.log("execute motor Off", executeCmdForMotorOff);
            await this.buildOpcuaExecutionCommand({
                argument_type: "boolean",
                argValue: false
            }, executeCmdForMotorOff, serverUrl, false)

            // Lets write value to blinds
            const executeCommand = this.buildOpcuaCommand(thingsIotmappingConfig, index);
            console.log("cmd", executeCommand);
            thingsIotmappingConfig.argValue = getThingType.argValue;
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig, executeCommand, serverUrl, false)

            // Lets execute motor off before making write function to blinds
            const executeCmdForMotorOn = this.buildOpcuaCommand({
                name_space: "ns=13",
                executing_command: "s=GVL.astSMIDevice[index].bSetPosition"
            }, index);
            console.log("execute  motor On", executeCmdForMotorOn);
            await this.buildOpcuaExecutionCommand({
                argument_type: "boolean",
                argValue: true
            }, executeCmdForMotorOn, serverUrl, false)
        } else {
            res.status(404).json({
                status: "error",
                message: "Things mapping configuration not found.",
                statusCode: 404
            });
        }
    }

    async executeDMXCommand(getThingType, res) {

        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfingOrdered(getThingType);
        const keys = getThingType.thing_id.split('_');
        const elements = new Float64Array(16);
        elements[0] = getThingType.argValue;
        console.log("THings", keys);

        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            // Lets execute 1s command to set elements
            const cmd1 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[0]);
            const cmd2 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[1]);
            const cmd3 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[2]);
            thingsIotmappingConfig[0].argValue = elements;
            // First setup set values to elements
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig[0], cmd1, serverUrl, true)
            // Second setup to address
            thingsIotmappingConfig[1].argValue = keys[2];
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig[1], cmd2, serverUrl, false)
            // Third setup to address 
            thingsIotmappingConfig[2].argValue = keys[3];
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig[2], cmd3, serverUrl, false)

        } else {
            res.status(404).json({
                status: "error",
                message: "Things mapping configuration not found.",
                statusCode: 404
            });
        }
    }
}
export default OpcuaProvider