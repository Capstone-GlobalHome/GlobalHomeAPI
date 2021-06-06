
import ThingsMappingRepo from '../repo/things_mapping_repo'
import DMXChannelOps from '../repo/dmx_channel_repo'

import { returnType } from "../opcua/returnType";

import OpcuaSessionHelper from '../opcua/opcua_session';
import { SENSOR_RANGES } from '../constants/sensor.ranges';
import { Common } from "../utilis/common";

import { buildCurtainHexString } from "../dataOperations/curtain_creator";


const opcuaSessionHelper = new OpcuaSessionHelper();

const opcua = require("node-opcua");
const { performance } = require('perf_hooks');
import _ from "lodash"

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
        console.log("OpcuaExecutionCommand", cmd);
        // console.log("Sending argument value", JSON.stringify(config.argValue));
        // console.log("Sending argument value", JSON.parse(JSON.stringify(config.argValue)));
        const status_code = await opcuaSessionHelper.writeToNode(serverUrl, cmd, this.buildWriteValueObject(config.argument_type,
            config.argValue, isArrayType));
        let obj = { "value": status_code.value, "description": status_code.description, "name:": status_code.name }
        return obj;
    }

    async buildOpcuaReadCommand(cmd, serverUrl) {
        console.log("Execute command for read operation", cmd);
        const dataValue = await opcuaSessionHelper.readNode(serverUrl, cmd);
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
            // Lets write value to blinds
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

    async executeDMXCommand(getThingType, res) {

        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfingOrdered(getThingType);
        const props = JSON.parse(getThingType.props);
        const address = props.address;
        console.log("address", address)
        console.log("DMX channel updating address ", address);
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            DMXChannelOps.findDMXChannelValueArray({ identifier: getThingType.identifier }).then(arrayStringValue => {
                const dmxChannelArray = JSON.parse(arrayStringValue.channel_array);
                dmxChannelArray[address - 1] = getThingType.argValue[0]
                const finalArrary = new Float64Array(Array.from(_.values(dmxChannelArray)));
                let serverUrl = getThingType.serverUrl;
                // Lets execute 1s command to set elements
                const cmd1 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[0]);
                thingsIotmappingConfig[0].argValue = finalArrary;
                // First setup set values to elements
                this.buildOpcuaExecutionCommand(thingsIotmappingConfig[0], cmd1, serverUrl, true)
                arrayStringValue.update({ id: arrayStringValue.id, channel_array: JSON.stringify(dmxChannelArray) });
            })

        } else {
            res.status(404).json({
                status: "error",
                message: "Things mapping configuration not found.",
                statusCode: 404
            });
        }

    }

    async executeDMXReadCommand(getThingType, res) {
        let r0 = performance.now();
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfig(getThingType);
        var r1 = performance.now()
        console.log("Reading things mapping configs in " + (r1 - r0) + " milliseconds.")
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            const executeCommand = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig);
            var t0 = performance.now()
            const output = await this.buildOpcuaReadCommand(executeCommand, serverUrl);
            var t1 = performance.now()
            console.log("DMX read operation takes " + (t1 - t0) + " milliseconds.")

            var m0 = performance.now()
            this.updateDmxChannelArray(output.value, getThingType.identifier);
            var m1 = performance.now()
            console.log("DMX arrary chnnel updte" + (m1 - m0) + " milliseconds.")

            const props = JSON.parse(getThingType.props);
            const address = props.address;
            let values = new Array();
            values.push(output.value[address - 1])
            console.log("Values", values);

            //code wiil help when we have multi channel dmx
            // const keys = getThingType.thing_id.split('_');
            // const statAddress = parseInt(keys[2]);
            // const noOfElements = parseInt(keys[3]);
            // for (let index = statAddress - 1; index < (statAddress + noOfElements - 1); index++) {
            //     console.log("data", (output.value[index]));
            // }
            // end here
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
        for (let range in SENSOR_RANGES[identifier]) {
            if (Common.inRange(value, range)) {
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


    async executeDMXParent(config, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.findThingMappingConfingOrdered(config);
        const dmxArrary = config.dmx_arrary;
        console.log("DMX channel updating address ", JSON.stringify(dmxArrary));
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            DMXChannelOps.findDMXChannelValueArray({ identifier: config.identifier }).then(arrayStringValue => {
                const dmxChannelArray = JSON.parse(arrayStringValue.channel_array);
                dmxArrary.forEach((item) => {
                    let index = parseInt(item.address);
                    dmxChannelArray[index - 1] = parseFloat(item.value)
                });
                const finalArrary = new Float64Array(Array.from(_.values(dmxChannelArray)));
                let serverUrl = config.serverUrl;
                // Lets execute 1s command to set elements
                const cmd1 = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig[0]);
                thingsIotmappingConfig[0].argValue = finalArrary;
                // First setup set values to elements
                this.buildOpcuaExecutionCommand(thingsIotmappingConfig[0], cmd1, serverUrl, true)
                arrayStringValue.update({ id: arrayStringValue.id, channel_array: JSON.stringify(dmxChannelArray) });
            })
        } else {
            console.error("Things mapping config not found")
        }
    }

    async updateDmxChannelArray(values, dmxIdentifier) {

        try {
            DMXChannelOps.findDMXChannelValueArray({ identifier: dmxIdentifier }).then(arrayStringValue => {
                const dmxChannelArray = JSON.parse(arrayStringValue.channel_array);
                values.forEach((item, index) => {
                    dmxChannelArray[index] = item;
                })
                arrayStringValue.update({ id: arrayStringValue.id, channel_array: JSON.stringify(dmxChannelArray) });
            })
        } catch (error) {
            console.log(error);
        }

    }

    async executeCurtainCommand(getThingType, res) {
        const thingsIotmappingConfig = await ThingsMappingRepo.find({
            identifier: getThingType.identifier,
            command: getThingType.command
        });
        if (typeof thingsIotmappingConfig !== 'undefined' && thingsIotmappingConfig !== null) {
            let serverUrl = getThingType.serverUrl;
            const hex = buildCurtainHexString(getThingType.props, thingsIotmappingConfig.props, getThingType.argValue);
            const executeCommand = this.buildOpcuaCommandWithoutIndex(thingsIotmappingConfig);
            console.log("cmd", executeCommand);
            console.log("hexvalue", hex);
            thingsIotmappingConfig.argValue = hex;
            await this.buildOpcuaExecutionCommand(thingsIotmappingConfig, executeCommand, serverUrl, false)
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