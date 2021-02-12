"use strict";

import { Validator } from 'node-input-validator'
import _ from "lodash"
// Models
import db from '../models'
const GlobalFeatureConfig = db.global_feature_config
const UserShortCut = db.user_shortcut;

class HomeController {

    // Get list of home features
    async getFeatures(req, res, next) {
        try {
            GlobalFeatureConfig.findAll({
                where: {
                    status: 1
                },
                order: [
                    ['position', 'ASC'],
                ],
                attributes: ['id', 'title', 'identifier', 'image', 'position', 'status']
            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No Units information is found with given property and building id",
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Global Feature list successfully.",
                        data: result
                    });

                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get list of home features
    async getFeaturesById(req, res, next) {
        try {
            const featureId = req.params.featureId;
            GlobalFeatureConfig.findByPk(featureId).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No information is found with given id:" + featureId,
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Feature information found successfully.",
                        data: result
                    });

                }
            })
        } catch (error) {
            next(error);
        }
    }

    //Create Feature entry
    async create(req, res, next) {
        try {
            const v = new Validator(req.body, {
                title: 'required',
                identifier: 'required',
                image: 'required',
                position: 'required',
                status: 'required',
                isParent: 'required',
                parentId: req.body.isParent ? 'string' : 'required'
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
                GlobalFeatureConfig.create({
                    title: req.body.title,
                    identifier: req.body.identifier,
                    image: req.body.image,
                    position: req.body.position,
                    status: req.body.status,
                    parentId: req.body.parentId,
                    isParent: req.body.isParent
                }).then((config) => {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Feature config created successfully.",
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
                title: 'required',
                identifier: 'required',
                image: 'required',
                position: 'required',
                status: 'required'
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
                GlobalFeatureConfig.findOne({
                    where: {
                        id: req.body.id
                    }
                }).then(result => {
                    if (!result) {
                        res.status(404).json({
                            status: "error",
                            message: "Feature Config information not found with id:" + req.body.id,
                            statusCode: 404
                        });
                    } else {
                        result.update(req.body).then((unit) => {
                            res.status(200).json({
                                statusCode: 200,
                                status: "success",
                                message: "Feature config updated successfully.",
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

    //Delete unit for the given propertyid and building id
    async delete(req, res, next) {
        try {
            GlobalFeatureConfig.destroy({
                where: {
                    id: req.body.id
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

    // add user shortcut
    async addShortCuts(req, res, next) {
        try {
            const v = new Validator(req.body, {
                userId: 'required',
                featureId: 'required'
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
                UserShortCut.findOne({
                    where: {
                        userId: req.body.userId,
                        fk_feature_id: req.body.featureId
                    }
                }).then(result => {
                    if (!result) {
                        UserShortCut.create({
                            userId: req.body.userId,
                            fk_feature_id: req.body.featureId,
                            access_count: 0
                        }).then((config) => {
                            res.status(200).json({
                                statusCode: 200,
                                status: "success",
                                message: "User shortcut created successfully.",
                                data: config
                            });
                        })
                    } else {
                        let { access_count } = result;
                        result.update({ access_count: access_count + 1 }).then((unit) => {
                            res.status(200).json({
                                statusCode: 200,
                                status: "success",
                                message: "User shortcut updated successfully.",
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
    // Get list of home features
    // Get list of user shortcuts
    async getUserShortCuts(req, res, next) {
        try {
            UserShortCut.findAll({
                where: {
                    userId: req.body.userId
                },
                include: [{
                    model: GlobalFeatureConfig,
                    as: "user_feature",
                    attributes: ['id', 'title', 'identifier', 'image', 'position', 'status']
                }],
                order: [
                    ['access_count', 'DESC'],
                ],
                attributes: ['id', 'access_count']
            }).then(result => {
                if (!result) {
                    res.status(404).json({
                        status: "error",
                        message: "No shortcuts information found information.",
                        statusCode: 404
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "success",
                        message: "Global Feature list successfully.",
                        data: result
                    });

                }
            });
        } catch (error) {
            next(error);
        }
    }
    async prepareHome(req, res, next) {
        let resonseBody = {
            features: [],
            shortcuts: []
        };
        const v = new Validator(req.body, {
            userId: 'required'
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
            GlobalFeatureConfig.findAll({
                where: {
                    isParent: true
                },
            }).then((data) => {
                resonseBody.features = data;
            }).then((data) => {
                UserShortCut.findAll({ 
                    where: { userId: req.body.userId },
                    order: [["access_count","DESC"]],
                    limit: 6
                }).then((shrt)=> {
                    if(shrt.length) {
                        resonseBody.shortcuts = shrt;
                        res.status(200).json({
                            data: resonseBody
                        });
                    } else {
                        let newShortCut = JSON.parse(JSON.stringify(resonseBody.features));
                        newShortCut = newShortCut.map((item)=> {
                            item.userId = req.body.userId;
                            item.fk_feature_id = item.id;
                            item.access_count = 0;
                            delete item.createdAt;
                            delete item.updatedAt;
                            delete item.id;
                            return item;
                        })
                        UserShortCut.bulkCreate(newShortCut).then(() => {
                            return UserShortCut.findAll();
                        }).then((newShrts)=> {
                            resonseBody.shortcuts = newShrts;
                            res.status(200).json({
                                data: resonseBody
                            });
                        });
                    }
                }).catch((err)=> {
                    console.log(err);
                    res.status(404);
                })
            });
        }
    }
    async addShortCut(req, res, next) {

    }


}

module.exports = new HomeController();