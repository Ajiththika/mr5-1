import mongoose from 'mongoose';

const locationContextSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hometown: {
        country: String,
        state: String,
        city: String,
        latitude: Number,
        longitude: Number
    },
    weather: {
        condition: String, // Sunny, Rain, Cloudy, Snow, etc.
        temperature: Number,
        humidity: Number,
        windSpeed: Number,
        lastUpdated: Date
    },
    uiPreferences: {
        theme: { type: String, default: 'dynamic' },
        currentColors: [String],
        dayNightMode: String
    }
}, {
    timestamps: true
});

const LocationContext = mongoose.model('LocationContext', locationContextSchema);

export default LocationContext;
