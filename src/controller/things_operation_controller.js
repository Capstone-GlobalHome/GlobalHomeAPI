"use strict";

import _ from "lodash"
// Models
import db from '../models'
import ThingsMappingRepo from '../repo/things_mapping_repo'
import ThingsConfigRepo from '../repo/things_config_repo'
import ProviderFactory from '../provider/ProviderFactory';

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
            console.log(error);
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

        // res.status(200).json({
        //     statusCode: 200,
        //     status: "success",
        //     message: "Things command executed successfully.",
        //     data: {}

        // });

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


    // Excute thing command to blinds
    async writeToblinds(req, res, next) {
        try {
            const thingIds = req.body.thing_ids;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const argValue = req.body.argValue;

            const getThingType = await ThingsConfigRepo.findBlindConfig(thingIds, identifier);

            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                for (let item of getThingType) {
                    const commandProtocol = item.command_protocal;
                    const protocol = new ProviderFactory();
                    protocol.getProvider(commandProtocol);
                    item.target_function = target_function;
                    item.command = command;
                    item.argValue = argValue;
                    protocol.provider.executeBlindsCommand(item, res)
                }
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

    async readBlindState(req, res, next) {

        try {
            const thingIds = req.body.thing_ids;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const getThingType = await ThingsConfigRepo.findBlindConfig(thingIds, identifier);
            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                let arrayValue = new Array();
                for (let item of getThingType) {
                    const commandProtocol = item.command_protocal;
                    const protocol = new ProviderFactory();
                    protocol.getProvider(commandProtocol);
                    item.target_function = target_function;
                    item.command = command;
                    const value = await protocol.provider.read(item, res);
                    // let map = new Map();
                    // map.set();
                    // console.log(map);
                    arrayValue.push({ [item.thing_id]: value.value });
                }
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Things command executed successfully.",
                    data: arrayValue
                });

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

    // Excute thing command to blinds
    writeToCurtainsMock(req, res, next) {

        try {

            res.status(200).json({
                statusCode: 200,
                status: "success",
                message: "Things command executed successfully.",
                data: {}
            });

        } catch (error) {
            next(error);
        }
    }

    async writeToCurtains(req, res, next) {

        try {
            const thingId = req.body.thing_id;
            const command = req.body.command;
            const argValue = req.body.value;
            const thingConfig = await ThingsConfigRepo.find({ thing_id: thingId });

            if (typeof thingConfig !== 'undefined' && thingConfig !== null) {
                const commandProtocol = thingConfig.command_protocal;
                const protocol = new ProviderFactory();
                protocol.getProvider(commandProtocol);
                thingConfig.command = command;
                thingConfig.argValue = argValue;
                protocol.provider.executeCurtainCommand(thingConfig, res)
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

    async readBlindCurtains(req, res, next) {

        try {
            const thingIds = req.body.thing_ids;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const getThingType = await ThingsConfigRepo.findBlindConfig(thingIds, identifier);
            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                let arrayValue = new Array();
                for (let item of getThingType) {
                    const commandProtocol = item.command_protocal;
                    const protocol = new ProviderFactory();
                    protocol.getProvider(commandProtocol);
                    item.target_function = target_function;
                    item.command = command;
                    const value = await protocol.provider.read(item, res);
                    // let map = new Map();
                    // map.set();
                    // console.log(map);
                    arrayValue.push({ [item.thing_id]: value.value });
                }
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Things command executed successfully.",
                    data: arrayValue
                });

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


    // Excute thing command to blinds
    async writeToDMX(req, res, next) {
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
                protocol.provider.executeDMXCommand(getThingType, res)
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
    // Read DMX state
    async readDMX(req, res, next) {

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
                const value = await protocol.provider.executeDMXReadCommand(getThingType, res)
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

            // if (typeof getThingType !== 'undefined' && getThingType !== null) {
            //     let arrayValue = new Array();
            //     for (let item of getThingType) {
            //         const commandProtocol = item.command_protocal;
            //         const protocol = new ProviderFactory();
            //         protocol.getProvider(commandProtocol);
            //         item.target_function = target_function;
            //         item.command = command;
            //         const value = await protocol.provider.read(item, res);
            //         // let map = new Map();
            //         // map.set();
            //         // console.log(map);
            //         arrayValue.push({ [item.thing_id]: value.value });
            //     }
            //     res.status(200).json({
            //         statusCode: 200,
            //         status: "success",
            //         message: "Things command executed successfully.",
            //         data: arrayValue
            //     });

            // } else {
            //     res.status(404).json({
            //         status: "error",
            //         message: "Things mapping configuration missing in database not found.",
            //         statusCode: 404
            //     });
            // }

        } catch (error) {
            next(error);
        }

    }
    // Read Sensors data state
    async readSensors(req, res, next) {

        try {
            const identifiers = req.body.identifiers;
            const sensorsConfig = await ThingsConfigRepo.findSensorsConfig(identifiers);
            if (sensorsConfig) {
                let arrayValue = new Array();
                for (let item of sensorsConfig) {
                    const commandProtocol = item.command_protocal;
                    const protocol = new ProviderFactory();
                    protocol.getProvider(commandProtocol);
                    item.target_function = "sensor";
                    item.command = "get";
                    const value = await protocol.provider.readSenorsData(item, res);
                    arrayValue.push({
                        [item.identifier]: value.value,
                        "label": value.label
                    });
                }
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Things command executed successfully.",
                    data: arrayValue
                });

            } else {
                res.status(404).json({
                    status: "error",
                    message: "Things mapping configuration missing in database not found.",
                    statusCode: 404
                });
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async executeDMXParent(req, res, next) {

        try {
            const thingId = req.body.thing_id;
            const identifier = req.body.identifier;
            const target_function = req.body.target_function;
            const command = req.body.command;
            const dmx_arrary = req.body.dmx_arrary;
            const thing_config = await ThingsConfigRepo.find({
                thing_id: thingId,
                identifier: identifier
            });

            if (typeof thing_config !== 'undefined' && thing_config !== null) {
                const commandProtocol = thing_config.command_protocal;
                const protocol = new ProviderFactory();
                protocol.getProvider(commandProtocol);
                thing_config.target_function = target_function;
                thing_config.command = command;
                thing_config.dmx_arrary = dmx_arrary;
                protocol.provider.executeDMXParent(thing_config)
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


}

module.exports = new ThingsOperationController();