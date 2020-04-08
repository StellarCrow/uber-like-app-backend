const express = require('express');
const router = new express.Router();
const DriverService = require('../../services/DriverService');
const checkPermission = require('../middleware/checkUserPermission.js');
const validate = require('../middleware/requestValidator');
const schemas = require('../../validation/JoiSchemas');
const role = require('../../utils/roles');


router.patch(
    '/trucks/:id/assign',
    validate(schemas.routeId, 'params'),
    checkPermission(role.DRIVER),
    async (req, res) => {
      const driverId = req.jwtUser.id;
      const truckId = req.params.id;

      try {
        const assigned = await DriverService.assignTruck(driverId, truckId);
        if (!assigned) {
          return res
              .status(404)
              .json({error: `Truck width id ${truckId} does not exist!`});
        }
        return res.status(200).json({status: 'Truck assigned successfully'});
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(500).json({error: err.message});
      }
    },
);


router.post(
    '/trucks',
    checkPermission(role.DRIVER),
    validate(schemas.createTruck, 'body'),
    async (req, res) => {
      const driverId = req.jwtUser.id;
      const truckInfo = {
        createdBy: driverId,
        status: 'FREE',
        type: req.body.type,
      };
      try {
        await DriverService.createTruck(truckInfo);
        return res.status(201).json({status: 'Truck created successfully'});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

router.get(
    '/trucks',
    checkPermission(role.DRIVER),
    async (req, res) => {
      const driverId = req.jwtUser.id;
      try {
        const trucks = await DriverService.getTrucks(driverId);
        return res.status(200).json({status: 'Success', trucks: trucks});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

module.exports = router;
