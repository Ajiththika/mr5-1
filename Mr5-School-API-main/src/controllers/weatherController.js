import WeatherService from "../services/weatherService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * @desc    Public weather lookup for classroom scene (no auth)
 * @route   GET /api/context/weather?lat=&lon=
 */
export const getPublicWeather = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({
      success: false,
      message: "lat and lon query parameters are required",
    });
  }

  const weather = await WeatherService.getWeatherData(lat, lon);
  res.status(200).json({ success: true, data: weather });
});
