"use strict";
import db from '../models'
const DMXChannelDB = db.dmx_channel

class DMXChannelOps {

    static async findDMXChannelValueArray(whereIn) {
        const project = await DMXChannelDB.findOne({
            where: whereIn
        });
        return project;

    }

    static async update(whereIn,channelArray) {
        const project = await DMXChannelDB.findOne({
            where: whereIn
        });
        return project;

    }

}

export default DMXChannelOps
