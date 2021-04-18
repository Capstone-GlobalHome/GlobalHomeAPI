"use strict";

// Models
import db from '../models';
const PresetDb = db.preset;

import { updatePresets } from "../dataOperations/preset_db_operation";


class ThingsPresetsController {

    //Get things presets information
    async getThingsPresets(req, res, next) {
        try {
            const thingId = req.body.thing_id;
            // { include: ["unit"] }
            PresetDb.findAll({
                where: {
                    fk_thing_id: thingId
                },
                order: [
                    ['position', 'ASC'],
                ],
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No preset found with thing_id:" + thingId,
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Presets fetch successfully.",
                        data: result
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async savePresets(req, res, next) {
        try {
            const parentId = req.body.parent_id;
            const presetId = req.body.preset_id;
            const groups = req.body.groups;
            groups.map(async group => {
                await updatePresets(group, presetId);
            });
            res.status(200).json({
                status: "success",
                message: "Preset value updated",
                data: null,
                statusCode: 200
            });

        } catch (error) {
            next(error);
        }

    }
}

module.exports = new ThingsPresetsController();