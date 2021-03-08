"use strict";

import { Validator } from 'node-input-validator'
import _ from "lodash"
// Models
import db from '../models'
const ThingDbOps = db.thing

class ThingsController {

    //Create Feature entry
    async create(req, res, next) {
        try {
            const v = new Validator(req.body, {
                name: 'required',
                identifier: 'required',
                image: 'required',
                isParent: 'required',
                status: 'required',
                roomId: 'required',
                position: 'required'
            })
            const matched = await v.check()
            if (!matched) {
                const errors = _.map(v.errors, value => value.message);
                res.status(422).json({
                    statusCode: 422,
                    status: "error",
                    message: errors,
                    data: null
                })
            } else {
                /**  If is parent is 1(true) then parent_id will be null -->Parent case
                 *   If parentId is 0 and has no parent_id ---> Independant Thing
                 *   Parent id is 0 and has parent_id----> child thing.
                 */
                ThingDbOps.create({
                    name: req.body.name,
                    identifier: req.body.identifier,
                    image: req.body.image,
                    isParent: req.body.isParent,
                    status: req.body.status,
                    fk_room_id: req.body.roomId,
                    parent_id: req.body.parentId,
                    position: req.body.position
                }).then((config) => {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Thing config created successfully.",
                        data: config
                    });
                })

            }
        } catch (error) {
            next(error);
        }
    }

    //update Feature 
    async update(req, res, next) {
        try {
            const v = new Validator(req.body, {
                id: 'required',
                name: 'required',
                identifier: 'required',
                image: 'required',
                isParent: 'required',
                status: 'required',
                roomId: 'required',
                position: 'required'
            })
            const matched = await v.check()
            if (!matched) {
                const errors = _.map(v.errors, value => value.message);
                res.status(422).json({
                    statusCode: 422,
                    status: "error",
                    message: errors,
                    data: null
                })
            } else {
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
            }
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
                    fk_room_id: roomId
                }, order: [
                    ['position', 'ASC'],
                ]
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

}

module.exports = new ThingsController();