"use strict";

import { Validator } from 'node-input-validator'
import _ from "lodash"
// Models
import db from '../models'
const Routine = db.routine;
import { DB_STATUS } from "../constants/modal.constant";

class RoutineController {
    async bulk(req, res, next) {
        try {
            let bulk = JSON.parse(JSON.stringify(req.body));
            bulk = bulk.filter((item) => {
                item.status = DB_STATUS.ACTIVE;
                return item;
            });
            Routine.bulkCreate(bulk).then((data) => {
                console.log("Routines create api success");
                res.status(200).json({
                    message: "success",
                    data: data,
                    statusCode: 200
                });
            })
        }
        catch (err) {
            console.log("Error while saving Routine", err);
            res.status(500).json({
                message: "Routines create api ended with errors",
                data: data,
                statusCode: 500
            });
        }
    }
    async create(req, res, next) {
        try {
            Routine.create({
                title: req.body.title,
                status: req.body.status ? req.body.status : DB_STATUS.ACTIVE,
                image: req.body.image
            }).then((data) => {

                console.log("Routines create api success");
                res.status(200).json({
                    message: "success",
                    data: data,
                    statusCode: 200
                });
            })
        }
        catch (err) {
            console.log("Error while saving Routine", err);
            res.status(500).json({
                message: "Routines create api ended with errors",
                data: data,
                statusCode: 500
            });
        }
    }

    async update(req, res, next) {
        try {
            Routine.findOne({
                where: {
                    id: req.body.id
                }
            }).then(result => {
                if (!result) {
                    console.log("Routines info not found with id :" + req.body.id);
                    res.status(404).json({
                        status: "error",
                        message: "Routines info not found found with id:" + req.body.id,
                        statusCode: 404
                    });
                } else {
                    result.update(req.body).then((unit) => {
                        console.log("Routines info updated for :" + req.body.id);
                        res.status(200).json({
                            statusCode: 200,
                            status: "success",
                            message: "Routines info updated successfully.",
                            data: unit
                        });
                    })
                }
            });
        }
        catch (err) {
            console.log("Error while update Routine", err);
            res.status(500).json({
                message: "Routines create api ended with errors",
                data: data,
                statusCode: 500
            });
        }
    }
    async list(req, res, next) {
        try {
            Routine.findAll({
                where: {
                    status: DB_STATUS.ACTIVE
                }
            }).then(result => {
                if (!result) {
                    console.log("No Routines info  found");
                    res.status(404).json({
                        status: "error",
                        message: "No Routines info  found",
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "List of routines successfully.",
                        data: result
                    });
                }
            });
        }
        catch (err) {
            console.log("Error while listing Routine", err);
            res.status(500).json({
                message: "Routines list api ended with errors",
                data: data,
                statusCode: 500
            });
        }
    }

    async delete(req, res, next) {
        try {
            const routineId = req.body.id;
            Routine.destroy({
                where: {
                    id: routineId
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


}
module.exports = new RoutineController();