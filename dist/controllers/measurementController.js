"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeasurement = exports.updateMeasurement = exports.createMeasurement = exports.getMeasurement = exports.getMeasurements = void 0;
const models_1 = require("../models");
const getMeasurements = async (req, res) => {
    try {
        const { customerId } = req.query;
        const whereClause = {};
        if (customerId)
            whereClause.customerId = customerId;
        const measurements = await models_1.Measurement.findAll({
            where: whereClause,
            include: [{ model: models_1.Customer, as: 'customer' }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ measurements });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMeasurements = getMeasurements;
const getMeasurement = async (req, res) => {
    try {
        const { id } = req.params;
        const measurement = await models_1.Measurement.findByPk(id, {
            include: [{ model: models_1.Customer, as: 'customer' }]
        });
        if (!measurement) {
            res.status(404).json({ error: 'Measurement not found' });
            return;
        }
        res.json({ measurement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMeasurement = getMeasurement;
const createMeasurement = async (req, res) => {
    try {
        const { customerId, garmentType, measurements, notes } = req.body;
        const customer = await models_1.Customer.findByPk(customerId);
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        const measurement = await models_1.Measurement.create({
            customerId,
            garmentType,
            measurements,
            notes
        });
        const fullMeasurement = await models_1.Measurement.findByPk(measurement.id, {
            include: [{ model: models_1.Customer, as: 'customer' }]
        });
        res.status(201).json({
            message: 'Measurement created successfully',
            measurement: fullMeasurement
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMeasurement = createMeasurement;
const updateMeasurement = async (req, res) => {
    try {
        const { id } = req.params;
        const { garmentType, measurements, notes } = req.body;
        const measurement = await models_1.Measurement.findByPk(id);
        if (!measurement) {
            res.status(404).json({ error: 'Measurement not found' });
            return;
        }
        await measurement.update({ garmentType, measurements, notes });
        const updatedMeasurement = await models_1.Measurement.findByPk(id, {
            include: [{ model: models_1.Customer, as: 'customer' }]
        });
        res.json({
            message: 'Measurement updated successfully',
            measurement: updatedMeasurement
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateMeasurement = updateMeasurement;
const deleteMeasurement = async (req, res) => {
    try {
        const { id } = req.params;
        const measurement = await models_1.Measurement.findByPk(id);
        if (!measurement) {
            res.status(404).json({ error: 'Measurement not found' });
            return;
        }
        await measurement.destroy();
        res.json({ message: 'Measurement deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMeasurement = deleteMeasurement;
//# sourceMappingURL=measurementController.js.map