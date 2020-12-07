"use strict";

import _ from "lodash"
// Models
import db from '../models'
import ThingsMappingRepo from '../repo/things_mapping_repo'
import ThingsConfigRepo from '../repo/things_config_repo'
import ProviderFactory from '../provider/ProviderFactory';
const ThingTypeDb = db.things_config

class ThingsOperationController {

    async createThingsConfig(req, res, next) {
        try {
            ThingsConfigRepo.create(req).then((config) => {
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Thing config created successfully.",
                    data: config
                });
            });
        } catch (error) {
            next(error);
        }
    }

    async createThingIotMappingConfig(req, res, next) {
        try {
            ThingsMappingRepo.create(req).then((config) => {
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Thing config created successfully.",
                    data: config
                });
            });
        } catch (error) {
            next(error);
        }
    }
    //Execute thing command
    async execute(req, res, next) {
        try {

            const thingId = req.body.thing_id;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const argValue = req.body.argValue;
            const getThingType = await ThingsConfigRepo.find({
                thing_id: thingId,
                identifier: identifier
            });
            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                const commandProtocol = getThingType.command_protocal;
                const protocol = new ProviderFactory();
                protocol.getProvider(commandProtocol);
                getThingType.target_function = target_function;
                getThingType.command = command;
                getThingType.argValue = argValue;
                protocol.provider.execute(getThingType, res)
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Things command executed successfully.",
                    data: {}
                });
            } else {
                res.status(404).json({
                    status: "error",
                    message: "Things configuration not found.",
                    statusCode: 404
                });
            }

        } catch (error) {
            next(error);
        }
    }

    //Execute thing command
    async read(req, res, next) {
        try {
            const thingId = req.body.thing_id;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const getThingType = await ThingsConfigRepo.find({
                thing_id: thingId,
                identifier: identifier
            });
            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                const commandProtocol = getThingType.command_protocal;
                const protocol = new ProviderFactory();
                protocol.getProvider(commandProtocol);
                getThingType.target_function = target_function;
                getThingType.command = command;
                const value = await protocol.provider.read(getThingType, res)
                if (typeof value !== 'undefined' && value !== null) {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Things command executed successfully.",
                        data: value
                    });
                } else {
                    res.status(404).json({
                        status: "error",
                        message: "Unable to read information of given node.",
                        statusCode: 404
                    });
                }
            } else {
                res.status(404).json({
                    status: "error",
                    message: "Things mapping configuration missing in database not found.",
                    statusCode: 404
                });
            }

        } catch (error) {
            next(error);
        }
    }


    //Execute thing command
    async tstCmd(req, res, next) {
        try {
            const protocol = new ProviderFactory();
            protocol.getProvider(req.body.protocol);
            const data = await protocol.provider.tstCmd(req.body)
            console.log("Data", data)
            if (typeof data !== 'undefined' && data !== null) {
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Things command executed successfully.",
                    data: { "value": data.value, "description": data.description, "name": data.name }

                });
            } else {
                res.status(404).json({
                    status: "error",
                    message: "Error on read/write operation",
                    statusCode: 404
                });
            }

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThingsOperationController();