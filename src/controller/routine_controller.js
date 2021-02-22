"use strict";

import { Validator } from 'node-input-validator'
import _ from "lodash"
// Models
import db from '../models'
const Routine = db.routine;

class RoutineController {
    async create(req, res, next) {
        try {
            Routine.create({
                name: req.body.name,
                image_url: req.body.image_url
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
}
module.exports = new RoutineController();