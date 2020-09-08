"use strict";
import { Validator } from 'node-input-validator'
import _ from "lodash"
// Models
import db from '../models'
const Unit = db.unit

class PropertiesUnitController {


  // Get list of units associated with given propertyid and building id
   async getUnits(req, res, next) {
    try {
      const propertyId = req.params.propertyId;
      const buildingId = req.params.buildingId;
      Unit.findAll({
        where: {
          property_id: propertyId,
          building_id: buildingId
        }
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
            message: "List of units successfully.",
            data: result
          });

        }
      });
    } catch (error) {
      next(error);
    }
  }
  // Get  units associated with given Unitid
   async getUnitsById(req, res, next) {
    try {
      const unitId = req.params.unitId;
      Unit.findByPk(unitId).then(result => {
        if (!result) {
          res.status(404).json({
            status: "error",
            message: "No Units information is found with given unitId:" + unitId,
            statusCode: 404
          });
        } else {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Unit information successfully.",
            data: result
          });

        }
      });
    } catch (error) {
      next(error);
    }
  }
  // Create unit for the given propertyid and building id
   async create(req, res, next) {
    try {
      const propertyId = req.params.propertyId;
      const buildingId = req.params.buildingId;
      const v = new Validator(req.body, {
        name: 'required',
        unit_type: 'required'
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
        Unit.create({
          name: req.body.name,
          unit_type: req.body.unit_type,
          property_id: propertyId,
          building_id: buildingId,
          physical_location: req.body.physical_location
        }).then((unit) => {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Unit created successfully.",
            data: unit
          });
        })
      }
    } catch (error) {
      next(error);
    }
  }


  //update unit for the given propertyid and building id
   async updateUnit(req, res, next) {
    try {
      const unitId = req.params.unitId;
      const v = new Validator(req.body, {
        id: 'required',
        name: 'required',
        unit_type: 'required'
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
        return;
      } else {
        Unit.findOne({
          where: {
            id: unitId
          }
        }).then(result => {
          if (!result) {
            res.status(404).json({
              status: "error",
              message: "Unit information not found with unitId:" + unitId,
              statusCode: 404
            });
          } else {
            result.update(req.body).then((unit) => {
              res.status(200).json({
                statusCode: 200,
                status: "success",
                message: "Unit updated successfully.",
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
   async deleteUnit(req, res, next) {
    try {
      const unitId = req.params.unitId;
      Unit.destroy({
        where: {
          id: unitId
        }
      }).then(num => {
        if (num >= 1) {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Unit deleted successfully.",
            data: null
          });
        } else {
          res.status(500).json({
            statusCode: 500,
            status: "error",
            message: "Something went wrong, unable to delete unit.",
            data: null
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // get all units irrespective of property id or building id
   async getAllUnit(req, res, next) {
    try {
      const unitAll = await Unit.findAll({ attributes: ['id', 'name', 'unit_type', 'property_id', 'building_id', 'physical_location', 'createdAt', 'updatedAt'] })
      console.log(unitAll)
      res.status(200).json({ error: false, message: "Units get successfully.", units: unitAll });
    } catch (error) {
      next(error);
    }
  }

}


module.exports= new PropertiesUnitController();