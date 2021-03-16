
import ThingsMappingRepo from '../repo/things_mapping_repo'

import { returnType } from "../opcua/returnType";

import OpcuaSessionHelper from '../opcua/opcua_session';
import {SENSOR_RANGES} from '../constants/sensor.ranges';
import { Common } from "../utilis/common";

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
        console.log("Write Value to Opcua",writeValue)
        return writeValue;
    }


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
        const noOfElements = keys[3]
        const elements = new Float64Array(16);
        for (let i = 0; i < noOfElements; i++) {
            elements[i] = getThingType.argValue[i];
        }
        console.log("THings", elements);

        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            // Lets execute 1s command to set elements
            const cmd1 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[0]);
            console.log("Cn1",cmd1);
            const cmd2 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[1]);
            console.log("Cn1",cmd2);
            const cmd3 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[2]);
            console.log("Cn1",cmd3);
            thingsIotmappingConfig[0].argValue = elements;
            // First setup set values to elements
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig[0], cmd1, serverUrl, true)
            // Second setup to address
            thingsIotmappingConfig[1].argValue = keys[2];
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig[1], cmd2, serverUrl, false)
            // Third setup to numberofelements 
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
    async executeDMXReadCommand(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            const executeCommand = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig);
            const output = await this.buildOpcuaReadCommand(executeCommand, serverUrl);
            const keys = getThingType.thing_id.split('_');
            const statAddress = parseInt(keys[2]);
            const noOfElements = parseInt(keys[3]);
            // console.log("statAddress", statAddress);
            // console.log("noOfElements", statAddress + noOfElements - 1);
            let values = new Array();
            for (let index = statAddress - 1; index < (statAddress + noOfElements - 1); index++) {
                console.log("data", (output.value[index]));
                values.push(output.value[index])
            }
            console.log("Values", values);
            return { [getThingType.thing_id]: values }
        } else {
            res.status(404).json({
                status: "error",
                message: "Things mapping configuration not found.",
                statusCode: 404
            });
        }
    }

    async readSenorsData(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            let index = getThingType.index;
            const executeCommand = this.buildOpcuaCommand(thingsIotmappingConfig, index);
            const output = await this.buildOpcuaReadCommand(executeCommand, serverUrl)
            output.label = this.getMeLabel(getThingType.identifier, output.value);
            return output;
        } else {
            return undefined;
        }

    }
     getMeLabel(identifier, value) {
        console.log("Identifier", identifier);
         for( let range in SENSOR_RANGES[identifier]) {
             if(Common.inRange(value, range)) {
                 return SENSOR_RANGES[identifier][range];
             }
         }
        
        // let status;
        // if (identifier==='SENSOR_CO2') {
        //     status="GOOD"
        // }else if(identifier==='SENSOR_VOC'){
        //     status="LOW"
        // }else if(identifier==='SENSOR_HUMIDITY'){
        //     status="IDEAL"
        // }else{
        //     status=""
        // }
        // console.log("value", value);
        // return status;
    }
    

}
export default OpcuaProvider