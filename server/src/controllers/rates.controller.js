import { RateFeed } from '../models/RateFeed.js';
import { getOrSeedCorridorRates, DEFAULT_CORRIDORS } from '../services/fxAggregator.service.js';

export const getCorridorRates = async (req, res, next) => {
  try {
    const { from = 'USD', to = 'EUR' } = req.query;
    const rates = await getOrSeedCorridorRates(from, to);

    res.status(200).json({
      status: 'success',
      data: rates,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCorridorsSummary = async (req, res, next) => {
  try {
    const corridorKeys = Object.keys(DEFAULT_CORRIDORS);
    const summaryPromises = corridorKeys.map(async (key) => {
      const [from, to] = key.split('-');
      return await getOrSeedCorridorRates(from, to);
    });

    const results = await Promise.all(summaryPromises);

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
