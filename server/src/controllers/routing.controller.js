import { calculateRoutingQuotes } from '../services/routingEngine.service.js';
import { AppError } from '../middleware/error.js';

export const getRoutingQuote = async (req, res, next) => {
  try {
    const { sourceCurrency = 'USD', targetCurrency = 'EUR', amount, strategy = 'LOWEST_COST' } = req.body;

    if (!amount || Number(amount) <= 0) {
      return next(new AppError('A valid positive transfer amount is required', 400));
    }

    const userPlan = req.user?.pricingPlan || 'basis_point_split';
    const basisPointSplitRate = req.user?.basisPointSplitRate || 20;

    const quote = await calculateRoutingQuotes({
      sourceCurrency: sourceCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      amount: Number(amount),
      strategy,
      userPlan,
      basisPointSplitRate,
    });

    res.status(200).json({
      status: 'success',
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};
