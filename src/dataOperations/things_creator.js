import db from '../models';
import { THING_TYPE } from "../constants/things.constant";
const ThingDbOps = db.thing;
const ThingsConfig = db.things_config;


export const thingsObj = {
    "name": null,
    "identifier": null,
    "image": null,
    "isParent": null,
    "status": null,
    "fk_room_id": null,
    "position": null,
    "parent_id": null,
    "thing_type": null
}
export const thingsConfigObj = {
    "index": null,
    "props": null,
    "command_protocal": null,
    "url": null,
    "thing_id": null
}

export class Thing {
    constructor(thingInitials) {
        this.thing = thingInitials;
    }
    async createNew() {
        // console.log("things8923893", ThingDbOps);
        // throw new Error();
        return ThingDbOps.create(this.thing)

    }
    async configure(config) {
        return ThingsConfig.create(config);
    }

};
export const buildDMXDataList = async (result, ThingDbOps, parent_id, res) => {
    let dmxListDataSet = {
        parent_id: null,
        groups: [
        ]
    };
    dmxListDataSet.id = parent_id;
    let promises = [];

    for (let item of result) {
        if (item.thing_type === THING_TYPE.GROUP_PARENT_CHILD) {
            dmxListDataSet.groups.push(item);
            promises.push(
                ThingDbOps.findAll({
                    where: {
                        parent_id: item.id
                    }
                })
            );
        }
    }
    let allChilds = await Promise.all(promises);
    allChilds = allChilds.flat();

    // for preset db call
    promises = [];
    for (let i = 0; dmxListDataSet.groups[i]; i++) {
        promises.push(ThingsConfig.findAll({
            where: {
                thing_id: dmxListDataSet.groups[i].id
            },
            attributes: ['id', 'props', 'thing_id', 'serverUrl', 'command_protocal'], 
        }))
    }
    let presets = await Promise.all(promises);

    presets = presets.flat();


    dmxListDataSet = JSON.parse(JSON.stringify(dmxListDataSet));

    for(let i=0; dmxListDataSet.groups[i]; i++) {
        let preset = presets.filter((el)=> el.thing_id === dmxListDataSet.groups[i].id);
        if(preset.length) {
            dmxListDataSet.groups[i].serverUrl = preset[0].serverUrl;
            dmxListDataSet.groups[i].command_protocal = preset[0].command_protocal;
            preset = JSON.parse(presets[0].props);
            dmxListDataSet.groups[i].presets = [];
            for(var item of preset.presets) {
                    var obj = {

                    };
                    obj[item.presetId] = item.value;
                    dmxListDataSet.groups[i].presets.push(obj);
            }
        }
    }

    for (let i = 0; dmxListDataSet.groups[i]; i++) {
        const children = allChilds.filter((el) => el.parent_id === dmxListDataSet.groups[i].id);
        if (children.length) {
            dmxListDataSet.groups[i].children = children;

            Object.assign({}, dmxListDataSet);

        }
    }

    promises = [];
    for (var i = 0; dmxListDataSet.groups[i]; i++) {
        if (dmxListDataSet.groups[i].children) {
            for (var j = 0; dmxListDataSet.groups[i].children[j]; j++) {
                promises.push(ThingsConfig.findAll({
                    where: {
                        thing_id: dmxListDataSet.groups[i].children[j].id
                    }
                }))
            }
        }
    }

    let allConfigs = await Promise.all(promises);
    allConfigs = allConfigs.flat();

    dmxListDataSet = JSON.parse(JSON.stringify(dmxListDataSet))
    for (var i = 0; dmxListDataSet.groups[i]; i++) {
        if (dmxListDataSet.groups[i].children) {
            for (var j = 0; dmxListDataSet.groups[i].children[j]; j++) {
                const config = allConfigs.filter((el)=> el.thing_id === dmxListDataSet.groups[i].children[j].id);
                if(config.length) {
                    dmxListDataSet.groups[i].children[j].childId = config[0].id;
                    var props = JSON.parse(config[0].props.replace(/'/g, '"'));
                    dmxListDataSet.groups[i].children[j].address = props.address;
                    dmxListDataSet.groups[i].children[j].index = config[0].index;
                    dmxListDataSet.groups[i].children[j].serverUrl = config[0].serverUrl;
                    dmxListDataSet.groups[i].children[j].protocal = config[0].command_protocal;
                    //Object.assign(dmxListDataSet.groups[i].children[j], config[0]);
                }
            }
        }
    }



    res.status(200).json({
        status: "success",
        // presets: presets,
        // data: allChilds,
        // parent: result,
        //allConfigs: allConfigs,
         data: dmxListDataSet,
        statusCode: 200
    });

    // if(result.thing_type === THING.CHILD || result.thing_type === null || result.thing_type === THING.INDIVIDUAl) {
    //     dmxListDataSet.groups.child.push(
    //         {
    //             address: defineAddressFromName(),
    //             name: "identifier"
    //         }
    //     )



    //console.log(result);
}
const dataBuilder = () => {

}
const defineAddressFromName = () => {

}

