"use strict";

import _ from "lodash"
// Models
import db from '../models'
import ThingsMappingRepo from '../repo/things_mapping_repo'
import ProviderFactory from '../provider/ProviderFactory';
const ThingTypeDb = db.thing_type
const ThingMappingConfigDb = db.thing_mapping_config

class ThingsOperationController {

    async createType(req, res, next) {
        try {
            ThingTypeDb.create({
                thing_id: req.body.thing_id,
                target: req.body.target,
                command: req.body.command,
                command_protocal: req.body.command_protocal,
                index: req.body.index
            }).then((config) => {
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Thing config created successfully.",
                    data: config
                });
            })
        } catch (error) {
            next(error);
        }
    }

    async createIotConfig(req, res, next) {
        try {
            ThingsMappingRepo.create(req).then((config) => {
                res.status(200).json({
                    statusCode: 200,
                    status: "success",
                    message: "Thing config created successfully.",
                    data: config
                });
            })
        } catch (error) {
            next(error);
        }
    }
    //Execute thing command
    async execute(req, res, next) {
        try {
            const thingId = req.body.thing_id;
            const identifier = req.body.target;
            const argValue = req.body.value;

            const getThingType = await ThingTypeDb.findOne({
                where: { thing_id: thingId, target: identifier }
            })

            if (typeof getThingType !== 'undefined' && getThingType !== null) {
                const commandProtocol = getThingType.command_protocal;
                // console.log(commandProtocol)
                const protocol = new ProviderFactory();
                protocol.getProvider(commandProtocol);
                protocol.provider.execute(getThingType, argValue)
            }
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

}

module.exports = new ThingsOperationController();