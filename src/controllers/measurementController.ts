import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Measurement, Customer } from '../models';

export const getMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.query;

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;

    const measurements = await Measurement.findAll({
      where: whereClause,
      include: [{ model: Customer, as: 'customer' }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ measurements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findByPk(id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!measurement) {
      res.status(404).json({ error: 'Measurement not found' });
      return;
    }

    res.json({ measurement });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, garmentType, measurements, notes } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const measurement = await Measurement.create({
      customerId,
      garmentType,
      measurements,
      notes
    });

    const fullMeasurement = await Measurement.findByPk(measurement.id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    res.status(201).json({
      message: 'Measurement created successfully',
      measurement: fullMeasurement
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { garmentType, measurements, notes } = req.body;

    const measurement = await Measurement.findByPk(id);
    if (!measurement) {
      res.status(404).json({ error: 'Measurement not found' });
      return;
    }

    await measurement.update({ garmentType, measurements, notes });

    const updatedMeasurement = await Measurement.findByPk(id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    res.json({
      message: 'Measurement updated successfully',
      measurement: updatedMeasurement
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const measurement = await Measurement.findByPk(id);
    if (!measurement) {
      res.status(404).json({ error: 'Measurement not found' });
      return;
    }

    await measurement.destroy();

    res.json({ message: 'Measurement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
