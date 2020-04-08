const express = require('express');
const router = new express.Router();
const ShipperService = require('../../services/ShipperService');
const DriverService = require('../../services/DriverService');
const checkPermission = require('../middleware/checkUserPermission.js');
const validate = require('../middleware/requestValidator');
const schemas = require('../../validation/JoiSchemas');
const role = require('../../utils/roles');

// create load
router.post(
    '/loads',
    checkPermission(role.SHIPPER),
    validate(schemas.createLoad, 'body'),
    async (req, res) => {
      const shipperId = req.jwtUser.id;
      const loadInfo = {
        dimensions: req.body.dimensions,
        payload: req.body.payload,
        name: 'Load',
        status: 'NEW',
        deliveryAddress: {
          city: 'Kyiv',
          street: 'street 32',
          zip: '07258',
        },
        pickUpAddress: {
          city: 'Kyiv',
          street: 'street 33',
          zip: '07249',
        },
      };

      try {
        await ShipperService.createLoad(shipperId, loadInfo);
        return res.status(200).json({status: 'Load created successfully'});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

// post load
router.patch(
    '/loads/:id/post',
    validate(schemas.routeId, 'params'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const loadId = req.params.id;

      try {
        const assignedTo = await ShipperService.postLoad(loadId);
        if (assignedTo) {
          return res
              .status(200)
              .json({status: 'Load posted successfully', assigned_to: assignedTo});
        } else {
          return res.status(200).json({status: 'No drivers found'});
        }
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(404).json({error: err.message});
      }
    },
);

router.get('/loads', async (req, res) => {
  const userRole = req.jwtUser.role;
  const userId = req.jwtUser.id;
  let loads;
  try {
    if (userRole === role.SHIPPER) {
      loads = await ShipperService.getLoadsList(userId);
    } else if (userRole === role.DRIVER) {
      loads = await DriverService.getLoad(userId);
    }
    return res.status(200).json({status: 'Success', loads: loads});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});

router.patch(
    '/loads/:id/state',
    validate(schemas.routeId, 'params'),
    checkPermission(role.DRIVER),
    async (req, res) => {
      const driverId = req.params.id;
      try {
        await DriverService.changeLoadState(driverId, state);
        return res.status(200).json({message: 'Success.'});
      } catch (err) {
        res.status(500).json({error: err.message});
      }
    },
);

module.exports = router;
