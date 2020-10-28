"use strict";
import db from '../models'
const ThingMappingConfigDb = db.thing_mapping_config

class ThingsMappingRepo {

    static async findThingMappingConfig(obj) {

        console.log(obj.command, obj.target);
        const project = await ThingMappingConfigDb.findOne({
            where: {
                target_function: obj.command,
                device_identifier: obj.target
            }
        });
        return project;

    }

    static create(req) {
        return ThingMappingConfigDb.create({
            target_function: req.body.target_function,
            device_identifier: req.body.identifier,
            name_space: req.body.name_space,
            executing_command: req.body.executing_command
        });
    }
}

export default ThingsMappingRepo
