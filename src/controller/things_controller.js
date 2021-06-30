"use strict";

import fs from "fs";
import path from "path";
import { THING_TYPE } from "../constants/things.constant";
import { buildDMXParent, Thing, thingsConfigObj, thingsObj } from "../dataOperations/things_creator";
// Models
import db from '../models';
import { raiseValidationError, validate } from "../utilis/common";

import thermostatData from "./static/thermostat.json";

const ThingDbOps = db.thing;
const PresetDb = db.preset;
const ThingsConfig = db.things_config;

const { Op } = require("sequelize");


class ThingsController {

    //Create Feature entry
    async create(req, res, next) {
        let matched, validationStatus;
        try {
            if (req.body.thing_type === THING_TYPE.CHILD) {
                // If Thing Type is child then validate request body for index, props, url and protocol
                validationStatus = validate(req.body, {
                    index: "required",
                    props: "required",
                    url: "required",
                    command_protocol: "required"
                });
                matched = await validationStatus.check();
                if (!matched) {
                    // Raise validation error if request body has missed some data
                    raiseValidationError(validationStatus, res);
                }

                /**
                 * If Thing type is child first create and then configure it
                 * So first put its entry in thing table and then configure it
                 * putting entry in things_config table with thing_id
                 */

                // Mapping Things Model with request body
                let thing = new Thing(Object.assign(thingsObj, req.body));

                thing.createNew()
                    .then((data) => {

                        console.log("Things creation is done successfully for child", data);
                        let settings = Object.assign(thingsConfigObj, req.body);
                        settings.thing_id = data.id;

                        thing.configure(settings).then((data) => {
                            console.log("Things configuration is done successfully for child", data);
                            res.status(200).json({
                                statusCode: 200,
                                status: "success",
                                message: "Thing config created successfully.",
                                data: data
                            });
                        }).catch((error) => {
                            console.log("Things config creation is ended with errors for child", data);
                            next(error);
                        });
                    }).catch((error) => {
                        console.log("Things creation is ended with errors for child", data);
                        next(error);
                    });
            }
            else {
                validationStatus = validate(req.body, {
                    name: 'required',
                    identifier: 'required',
                    image: 'required',
                    isParent: 'required',
                    status: 'required',
                    fk_room_id: 'required',
                    parent_id: 'required',
                    position: 'required',
                    thing_type: 'required'
                })
            }
            matched = await validationStatus.check();
            if (!matched) {
                raiseValidationError(validationStatus, res);
            }
            /**  If is parent is 1(true) then parent_id will be null -->Parent case
             *   If parentId is 0 and has no parent_id ---> Independant Thing
             *   Parent id is 0 and has parent_id----> child thing.
             */
            // ThingDbOps.create({
            //     name: req.body.name,
            //     identifier: req.body.identifier,
            //     image: req.body.image,
            //     isParent: req.body.isParent,
            //     status: req.body.status,
            //     fk_room_id: req.body.fk_room_id,
            //     parent_id: req.body.parent_id,
            //     position: req.body.position,
            //     address: req.body.address,
            //     thing_type: req.body.thing_type
            // }).then((config) => {
            //     res.status(200).json({
            //         statusCode: 200,
            //         status: "success",
            //         message: "Thing config created successfully.",
            //         data: config
            //     });
            // })

        }
        catch (error) {
            next(error);
        }
    }


    //update Feature 
    async update(req, res, next) {
        try {
            ThingDbOps.findOne({
                where: {
                    id: req.body.id
                }
            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "Things Config information not found with id:" + req.body.id,
                        statusCode: 404
                    });
                } else {
                    result.update(req.body).then((unit) => {
                        res.status(200).json({
                            statusCode: 200,
                            status: "success",
                            message: "Things config updated successfully.",
                            data: unit
                        });
                    })
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get list of units associated with given propertyid and building id
    async getThingsInRooms(req, res, next) {
        try {
            const roomId = req.body.roomId;
            ThingDbOps.findAll({
                where: {
                    [Op.and]: [{ fk_room_id: roomId }, { status: 1 }, {
                        [Op.or]: [
                            {
                                [Op.and]: [{ thing_type: THING_TYPE.INDIVIDUAL }
                                ]
                            },
                            {
                                [Op.and]: [
                                    { parent_id: { [Op.is]: null } },
                                    { thing_type: { [Op.in]: [THING_TYPE.GROUP, THING_TYPE.GROUP_PARENT] } }
                                ]
                            }]
                    }],
                }
                , order: [
                    ['position', 'ASC'],
                ]
            })
                .then(result => {
                    if (!result) {
                        res.status(404).json({
                            status: "error",
                            message: "No things config information is found ",
                            statusCode: 404
                        });
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            status: "success",
                            message: "List of things successfully.",
                            data: result
                        });

                    }
                });
        } catch (error) {
            next(error);
        }
    }
    // Get list of units associated with given propertyid and building id
    async getChildThings(req, res, next) {
        try {
            const parentId = req.params.parentId;
            ThingDbOps.findAll({
                where: {
                    parent_id: parentId,
                    status: 1
                }
            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No things config information is found ",
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "List of things successfully.",
                        data: result
                    });

                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get list of units associated with given propertyid and building id
    async getDMX(req, res, next) {
        try {
            const parentId = req.body.thing_id;
            ThingDbOps.findAll({
                where: {
                    parent_id: parentId,
                    status: 1
                },
                include: [{
                    model: ThingDbOps,
                    as: "childs",
                    order: [
                        ['position', 'ASC']
                      ],
                    include: [
                        {
                            model: ThingsConfig,
                            as: 'config'
                        }
                    ]
                },
                {
                    model: ThingsConfig,
                    as: "config"
                }]
                , order: [
                    ['position', 'ASC']
                ]

            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No things  information is found ",
                        statusCode: 404
                    });
                } else {
                    buildDMXParent(result, req.body.thing_id, res);
                }
            });
        } catch (error) {
            next(error);
        }
    }


    //Delete unit for the given propertyid and building id
    async delete(req, res, next) {
        try {
            const thingId = req.params.id;
            ThingDbOps.destroy({
                where: {
                    id: thingId
                }
            }).then(num => {
                if (num >= 1) {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Information deleted successfully.",
                        data: null
                    });
                } else {
                    res.status(500).json({
                        statusCode: 500,
                        status: "error",
                        message: "Something went wrong, unable to delete info.",
                        data: null
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //Get things individual information
    async getThing(req, res, next) {
        try {
            const thingId = req.params.id;
            // { include: ["unit"] }
            ThingDbOps.findByPk(thingId).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No Room information is found with given roomId:" + thingId,
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Room information successfully.",
                        data: result
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }

    getMockDMXList(req, res, next) {
        try {

            fs.readFile(path.resolve(__dirname, "./static/dmxList.json"), 'utf8', function (err, dmxList) {
                if (err) {
                    console.log(err);
                }

                res.json(JSON.parse(dmxList));
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    savePresets(req, res, next) {
        try {
            res.status(200).json({
                status: "success",
                message: "Preset information updated ",
                data: null,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }

    }

    getThermoStatData(req, res, next) {
        try {
            res.status(200).json({
                status: "success",
                message: `Thermostat details for Thermostat Id ${req.params.id}`,
                data: thermostatData.get,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }

    setThermoStatData(req, res, next) {
        try {
            res.status(200).json({
                status: "success",
                message: `Thermostat details for Thermostat Id ${req.body.id} updated`,
                data: thermostatData.post,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new ThingsController();