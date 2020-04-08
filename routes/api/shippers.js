const express = require('express');
const router = new express.Router();
const ShipperService = require('../../services/ShipperService');
const checkPermission = require('../middleware/checkUserPermission.js');
const validate = require('../middleware/requestValidator');
const schemas = require('../../validation/JoiSchemas');
const role = require('../../utils/roles');

// get shipper profile
router.get(
    '/shippers/:id',
    validate(schemas.routeId, 'params'),
    async (req, res) => {
      const shipperId = req.params.id;
      try {
        const shipper = await ShipperService.getProfile(shipperId);
        if (!shipper) {
          return res.status(404).json({error: 'Not found'});
        }
        return res.status(200).json({shipper: shipper});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

// delete shipper profile
router.delete(
    '/shippers/:id',
    validate(schemas.routeId, 'params'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const shipperId = req.params.id;
      try {
        const deletedShipper = await ShipperService.deleteShipper(shipperId);
        if (!deletedShipper) {
          return res.status(404).json({error: 'Not found'});
        }
        return res
            .status(200)
            .json({message: 'Shipper was successfully deleted'});
      } catch (err) {
        res.status(500).json({error: err.message});
      }
    },
);

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

// update load
router.put(
    '/shippers/:id/loads/:sid',
    validate(schemas.routeIds, 'params'),
    checkPermission(role.SHIPPER),
    validate(schemas.updateLoad, 'body'),
    async (req, res) => {
      const loadId = req.params.sid;
      const body = req.body;
      const infoToUpdate = {};

      for (const property in body) {
        if (body[property]) {
          infoToUpdate[property] = body[property];
        }
      }

      try {
        const updatedLoad = await ShipperService.updateLoad(loadId, infoToUpdate);
        if (!updatedLoad) {
          return res.status(404).json({error: 'Load not found'});
        }
        return res.status(200).json({load: updatedLoad});
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(400).json({error: err.message});
      }
    },
);

// delete load
router.delete(
    '/shippers/:id/loads/:sid',
    validate(schemas.routeIds, 'params'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const loadId = req.params.sid;
      try {
        const deletedLoad = await ShipperService.deleteLoad(loadId);
        if (!deletedLoad) {
          return res.status(404).json({error: 'Load not found'});
        }
        return res.status(200).json({message: 'Load was successfully deleted'});
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

// get shipping info
router.get(
    '/shippers/:id/loads/:sid/logs',
    validate(schemas.routeIds, 'params'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const loadId = req.params.sid;
      try {
        const logs = await ShipperService.getShippingInfo(loadId);
        if (!logs) {
          return res.status(404).json({error: 'Load not found'});
        }
        return res.status(200).json({logs: logs});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

// get assigned to driver loads
router.get(
    '/shippers/:id/loads/assigned',
    validate(schemas.routeId, 'params'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const shipperId = req.params.id;
      try {
        const loads = await ShipperService.getAssignedLoads(shipperId);
        return res.status(200).json({loads});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);

// get list of loads
router.get(
    '/shippers/:id/loads/(:query)?',
    validate(schemas.routeId, 'params'),
    validate(schemas.loadsQuery, 'query'),
    checkPermission(role.SHIPPER),
    async (req, res) => {
      const shipperId = req.params.id;
      const statusFilter = req.query.filter || '';
      const page = parseInt(req.query.page) || 1;

      try {
        const {loads, paginateInfo} = await ShipperService.getLoadsList(
            shipperId,
            statusFilter,
            page,
        );
        return res
            .status(200)
            .json({meta: {pagination: paginateInfo, filter: statusFilter}, loads});
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    },
);
module.exports = router;
