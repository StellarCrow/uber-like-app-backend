const express = require('express');
const router = new express.Router();
const DriverService = require('../../services/DriverService');
const checkPermission = require('../middleware/checkUserPermission.js');
const validate = require('../middleware/requestValidator');
const schemas = require('../../validation/JoiSchemas');
const role = require('../../utils/roles');

// driver full profile info
router.get(
    '/drivers/:id',
    validate(schemas.routeId, 'params'),
    async (req, res) => {
      const driverId = req.params.id;
      try {
        const driver = await DriverService.getProfile(driverId);
        if (!driver) {
          return res.status(404).json({error: 'Not found'});
        }
        return res.status(200).json({driver: driver});
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(400).json({error: err.message});
      }
    },
);

// update truck info
router.put(
    '/drivers/:id/trucks/:sid',
    validate(schemas.routeIds, 'params'),
    checkPermission(role.DRIVER),
    validate(schemas.truckUpdate, 'body'),
    async (req, res) => {
      const driverId = req.params.id;
      const truckId = req.params.sid;
      const truckInfo = {
        id: truckId,
        name: req.body.name,
      };
      try {
        const updatedTruck = await DriverService.updateTruck(driverId, truckInfo);
        if (!updatedTruck) {
          return res
              .status(404)
              .json({error: `Truck width id ${truckId} does not exist!`});
        }
        return res.status(200).json({truck: updatedTruck});
      } catch (err) {
        res.status(500).json({error: err.message});
      }
    },
);

// delete truck
router.delete(
    '/drivers/:id/trucks/:sid',
    validate(schemas.routeIds, 'params'),
    checkPermission(role.DRIVER),
    async (req, res) => {
      const driverId = req.params.id;
      const truckId = req.params.sid;

      try {
        const deletedTruck = await DriverService.deleteTruck(driverId, truckId);
        if (!deletedTruck) {
          return res
              .status(404)
              .json({error: `Truck width id ${truckId} does not exist!`});
        }
        res.status(200).json({message: 'Successfully deleted'});
      } catch (err) {
        if (err.name === 'ServerError') {
          res.status(500).json({error: err.message});
        }
        res.status(400).json({error: err.message});
      }
    },
);

module.exports = router;
