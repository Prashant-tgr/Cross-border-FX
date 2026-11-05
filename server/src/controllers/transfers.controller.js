import { Transfer } from '../models/Transfer.js';
import { Supplier } from '../models/Supplier.js';
import { AppError } from '../middleware/error.js';

export const executeTransfer = async (req, res, next) => {
  try {
    const {
      supplierId,
      invoiceNumber,
      sourceCurrency,
      sourceAmount,
      targetCurrency,
      netLandingAmount,
      routingDecision,
      pricingBreakdown,
      deliveryEstimateHours,
    } = req.body;

    const supplier = await Supplier.findOne({ _id: supplierId, userId: req.user._id });
    if (!supplier) {
      return next(new AppError('Target supplier does not exist or does not belong to your account', 400));
    }

    const referenceNumber = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transfer = await Transfer.create({
      userId: req.user._id,
      supplierId,
      referenceNumber,
      invoiceNumber,
      sourceCurrency: sourceCurrency.toUpperCase(),
      sourceAmount: Number(sourceAmount),
      targetCurrency: targetCurrency.toUpperCase(),
      netLandingAmount: Number(netLandingAmount),
      routingDecision,
      pricingBreakdown,
      deliveryEstimateHours: deliveryEstimateHours || 24,
      status: 'IN_CLEARING',
    });

    // Update supplier total volume
    supplier.totalDisbursedAmount += Number(netLandingAmount);
    await supplier.save();

    res.status(201).json({
      status: 'success',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransfers = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [transfers, total] = await Promise.all([
      Transfer.find(filter)
        .populate('supplierId', 'supplierName country settlementCurrency bankName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transfer.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      total,
      results: transfers.length,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransferById = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, userId: req.user._id }).populate(
      'supplierId',
      'supplierName country settlementCurrency bankName accountNumberOrIban swiftBicOrRouting'
    );

    if (!transfer) {
      return next(new AppError('Transfer not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const transfers = await Transfer.find({ userId: req.user._id });

    const totalTransfers = transfers.length;
    let totalVolumeUSD = 0;
    let totalDirectFeesPaid = 0;
    let totalBenchmarkCost = 0;
    let totalClientSavings = 0;
    let totalPlatformProfitSplit = 0;

    const railBreakdown = {
      SWIFT: 0,
      LOCAL_RAILS: 0,
      FINTECH_PARTNER: 0,
    };

    transfers.forEach((t) => {
      totalVolumeUSD += t.sourceAmount || 0;
      totalDirectFeesPaid += t.pricingBreakdown?.totalFeeSourceCurrency || 0;
      totalBenchmarkCost += t.pricingBreakdown?.benchmarkBankCost || 0;
      totalClientSavings += t.pricingBreakdown?.savedAmountSourceCurrency || 0;
      totalPlatformProfitSplit += t.pricingBreakdown?.profitSplitTake || 0;

      const railType = t.routingDecision?.selectedRailType;
      if (railBreakdown[railType] !== undefined) {
        railBreakdown[railType] += 1;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalTransfers,
        totalVolumeUSD: Number(totalVolumeUSD.toFixed(2)),
        totalDirectFeesPaid: Number(totalDirectFeesPaid.toFixed(2)),
        totalBenchmarkCost: Number(totalBenchmarkCost.toFixed(2)),
        totalClientSavings: Number(totalClientSavings.toFixed(2)),
        averageSavingsPercentage:
          totalBenchmarkCost > 0 ? Number(((totalClientSavings / totalBenchmarkCost) * 100).toFixed(1)) : 0,
        monetization: {
          currentPlan: req.user.pricingPlan,
          retainerMonthly: 2000,
          totalProfitSplitEarned: Number(totalPlatformProfitSplit.toFixed(2)),
        },
        railBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
