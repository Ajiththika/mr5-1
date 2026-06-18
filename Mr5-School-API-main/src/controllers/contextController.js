import LocationContext from '../models/LocationContext.js';
import WeatherService from '../services/weatherService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get or update location context for a user
 * @route   POST /api/context/sync
 * @access  Private
 */
export const syncContext = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { latitude, longitude, country, state, city } = req.body;

    let context = await LocationContext.findOne({ userId });

    // Update location if provided
    const hometown = {
        country: country || (context?.hometown?.country),
        state: state || (context?.hometown?.state),
        city: city || (context?.hometown?.city),
        latitude: latitude || (context?.hometown?.latitude),
        longitude: longitude || (context?.hometown?.longitude)
    };

    // Only fetch weather if we have coordinates
    let weatherData = context?.weather || WeatherService.getMockWeather();

    if (hometown.latitude && hometown.longitude) {
        // Cache management: only update if last update was > 15 mins ago
        const fifteenMins = 15 * 60 * 1000;
        const shouldUpdate = !context?.weather?.lastUpdated ||
            (new Date() - new Date(context.weather.lastUpdated)) > fifteenMins;

        if (shouldUpdate) {
            const freshWeather = await WeatherService.getWeatherData(hometown.latitude, hometown.longitude);
            weatherData = {
                ...freshWeather,
                lastUpdated: new Date()
            };
        }
    }

    const hour = WeatherService.getHourForTimezone(req.body.timezone);
    const uiProps = WeatherService.deriveUIProps(weatherData, hour);

    if (!context) {
        context = await LocationContext.create({
            userId,
            hometown,
            weather: weatherData,
            uiPreferences: {
                theme: uiProps.theme,
                currentColors: uiProps.colors,
                dayNightMode: uiProps.isNight ? 'night' : 'day'
            }
        });
    } else {
        context.hometown = hometown;
        context.weather = weatherData;
        context.uiPreferences = {
            theme: uiProps.theme,
            currentColors: uiProps.colors,
            dayNightMode: uiProps.isNight ? 'night' : 'day'
        };
        await context.save();
    }

    res.status(200).json({
        success: true,
        data: context
    });
});

/**
 * @desc    Get current user's context
 * @route   GET /api/context/me
 * @access  Private
 */
export const getMyContext = asyncHandler(async (req, res) => {
    const context = await LocationContext.findOne({ userId: req.user.id });
    if (!context) {
        return res.status(404).json({ success: false, message: "Context not found" });
    }
    res.status(200).json({ success: true, data: context });
});
