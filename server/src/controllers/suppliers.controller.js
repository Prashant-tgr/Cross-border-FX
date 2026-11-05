import { Supplier } from '../models/Supplier.js';
import { AppError } from '../middleware/error.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const {
      supplierName,
      contactEmail,
      country,
      settlementCurrency,
      bankName,
      accountNumberOrIban,
      swiftBicOrRouting,
      category,
      preferredRoutingStrategy,
    } = req.body;

    const supplier = await Supplier.create({
      userId: req.user._id,
      supplierName,
      contactEmail,
      country,
      settlementCurrency: settlementCurrency.toUpperCase(),
      bankName,
      accountNumberOrIban,
      swiftBicOrRouting,
      category,
      preferredRoutingStrategy,
    });

    res.status(201).json({
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, userId: req.user._id });

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
