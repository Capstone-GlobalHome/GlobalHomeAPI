"use strict";
import { Validator } from 'node-input-validator'
import _ from "lodash"
import Helper from "../utilis/Helper"
import { MESSAGES } from "../constants/user.constant"
// Models
import db from '../models'
const Room = db.room

class RoomsController {

  async getRoomById(req, res, next) {
    try {
      const roomId = req.params.roomId;
      // { include: ["unit"] }
      Room.findByPk(roomId, { include: ["unit"] }).then(result => {
        if (!result) {
          res.status(404).json({
            status: "error",
            message: "No Room information is found with given roomId:" + roomId,
            statusCode: 404
          });
        } else {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Room information successfully.",
            data: result
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get list of rooms inside unit
  async getRoomByUnitID(req, res, next) {
    try {
      const unitId = req.params.unitId;
      const rooms = await Room.findAll({ where: { fk_unit_id: unitId } })
      if (typeof rooms !== 'undefined' && rooms !== null) {
        res.status(200).json({ error: false, message: "List of rooms by unit id.", data: rooms });
      } else {
        res.status(404).json({ error: true, message: MESSAGES.DATA_NOT_FOUND })
      }
    } catch (error) {
      next(error);
    }
  }

  // create room api controller
  async createRoom(req, res, next) {
    try {
      const v = new Validator(req.body, {
        nick_name: 'required',
        type: 'required',
        physical_location: 'required',
        unit_id: 'required'
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
        Room.create({
          nick_name: req.body.nick_name,
          type: req.body.type,
          physical_location: req.body.physical_location,
          fk_unit_id: req.body.unit_id
        }).then((unit) => {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Room created successfully.",
            data: unit
          });
        })
      }
    } catch (error) {
      next(error);
    }
  }

  // update room api controller
  async updateRoom(req, res, next) {
    try {
      const roomId = req.params.roomId
      const v = new Validator(req.body, {
        id: 'required',
        nick_name: 'required',
        type: 'required',
        physical_location: 'required'
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
        Room.findOne({
          where: {
            id: roomId
          }
        }).then(result => {
          if (!result) {
            res.status(404).json({
              status: "error",
              message: "Unit information not found with unitId:" + unitId,
              statusCode: 404
            });
          } else {
            result.update(req.body).then((room) => {
              res.status(200).json({
                statusCode: 200,
                status: "success",
                message: "Room updated successfully.",
                data: room
              });
            })
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }
  // delete room api controller
  async deleteRoom(req, res, next) {
    try {
      const roomId = req.params.roomId
      Room.destroy({
        where: {
          id: roomId
        }
      }).then(num => {
        if (num >= 1) {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Room info deleted successfully.",
            data: null
          });
        } else {
          res.status(500).json({
            statusCode: 500,
            status: "error",
            message: "Something went wrong, unable to delete room.",
            data: null
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomsController();

