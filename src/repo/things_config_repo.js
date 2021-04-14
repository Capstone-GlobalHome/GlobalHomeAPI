"use strict";
import db from '../models'
const ThingsConfigDb = db.things_config

const { Op } = require("sequelize");

class ThingsConfigRepo {

    static create(req) {
        return ThingsConfigDb.create({
            index: req.body.index,
            thing_id: req.body.thing_id,
            identifier: req.body.identifier,
            props: req.body.props,
            serverUrl: req.body.serverUrl,
            command_protocal: req.body.command_protocal
        });
    }

    static find(conditions) {
        return ThingsConfigDb.findOne({
            where: conditions
        });
    }
    static findBlindConfig(thingsId, identifier) {
        return ThingsConfigDb.findAll({
            where: {
                thing_id: { [Op.in]: thingsId },
                identifier: identifier
            }
        });
    }
    static findSensorsConfig(identifiers) {
        return ThingsConfigDb.findAll({
            where: {
                identifier: { [Op.in]: identifiers }
            }
        });
    }
}

export default ThingsConfigRepo
