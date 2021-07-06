import db from '../models';
const ThingDbOps = db.thing;
const ThingsConfig = db.things_config;



export const updatePresets = async (group, presetId) => {

    // console.log("Groupr:- ", JSON.stringify(group), "\n parentid:", parentId, "\npresetId", presetId);
    try {
        ThingsConfig.findOne({
            where: {
                thing_id: group.id
            }
        }).then(result => {
            if (!result) {
                console.error("Things config not found with ", group.id);
            } else {
                const props = JSON.parse(result.props);
                console.log("props:", props);
                const transformProps = buildPropsForPresetUpdate(props, presetId, group.value);
                console.log("transformProps:", transformProps);
                result.update(Object.assign({}, { props: transformProps }));
            }
        });

    } catch (error) {
        next(error);
    }


}

const buildPropsForPresetUpdate = (props, presetId, value) => {
    if (props && props.presets) {
        try {
            console.log("PresetId", presetId);
            let index = props.presets.findIndex((obj => obj.presetId == presetId));
            props.presets[index].value = value;
        } catch (error) {
            console.error(error);
        }
    }
    return JSON.stringify(props);

}