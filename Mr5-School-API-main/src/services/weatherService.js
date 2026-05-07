import axios from 'axios';

class WeatherService {
    static async getWeatherData(lat, lon) {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            console.warn("WEATHER_API_KEY is not defined. Using mock data.");
            return this.getMockWeather();
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);

            return {
                condition: response.data.weather[0].main,
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                city: response.data.name
            };
        } catch (error) {
            console.error("Error fetching weather data:", error.message);
            return this.getMockWeather();
        }
    }

    static getMockWeather() {
        return {
            condition: "Clear",
            temperature: 25,
            humidity: 50,
            windSpeed: 2,
            city: "Default City"
        };
    }

    /**
     * Determine UI context based on weather and time
     */
    static deriveUIProps(weather, hour) {
        let theme = "sunny";
        let colors = ["#FFD700", "#FF8C00"]; // Gold, DarkOrange
        let isNight = hour < 6 || hour > 18;

        if (isNight) {
            theme = "night";
            colors = ["#191970", "#000080"]; // MidnightBlue, Navy
        } else if (weather.condition.toLowerCase().includes("rain")) {
            theme = "rainy";
            colors = ["#4682B4", "#708090"]; // SteelBlue, SlateGray
        } else if (weather.condition.toLowerCase().includes("cloud")) {
            theme = "cloudy";
            colors = ["#B0C4DE", "#778899"]; // LightSteelBlue, LightSlateGray
        }

        return { theme, colors, isNight };
    }
}

export default WeatherService;
