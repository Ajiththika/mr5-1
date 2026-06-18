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
            temperature: 22,
            humidity: 52,
            windSpeed: 2.5,
            city: "Local Classroom",
        };
    }

    static getHourForTimezone(timezone) {
        if (!timezone) return new Date().getHours();
        try {
            const parts = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "numeric",
                hour12: false,
            }).formatToParts(new Date());
            const hour = parts.find((part) => part.type === "hour")?.value;
            return hour ? Number(hour) : new Date().getHours();
        } catch {
            return new Date().getHours();
        }
    }

    /**
     * Determine UI context based on weather and local time
     */
    static deriveUIProps(weather, hour) {
        const temp = weather.temperature ?? 20;
        const wind = weather.windSpeed ?? 0;
        const key = (weather.condition || "Clear").toLowerCase();

        let theme = "sunny";
        let colors = ["#FFD700", "#FF8C00"];
        let isNight = hour < 5 || hour >= 20;

        if (hour >= 5 && hour < 11) {
            colors = ["#FDE68A", "#F59E0B"];
        } else if (hour >= 17 && hour < 20) {
            colors = ["#FB923C", "#EA580C"];
        }

        if (isNight) {
            theme = "night";
            colors = ["#191970", "#000080"];
        } else if (key.includes("thunder")) {
            theme = "thunderstorm";
            colors = ["#334155", "#0f172a"];
        } else if (key.includes("rain") || key.includes("drizzle")) {
            theme = "rainy";
            colors = ["#4682B4", "#708090"];
        } else if (key.includes("mist") || key.includes("fog") || key.includes("haze")) {
            theme = "foggy";
            colors = ["#94A3B8", "#64748B"];
        } else if (key.includes("cloud")) {
            theme = "cloudy";
            colors = ["#B0C4DE", "#778899"];
        } else if (temp <= 8) {
            theme = "cold";
            colors = ["#BFDBFE", "#60A5FA"];
        } else if (wind >= 8) {
            theme = "windy";
            colors = ["#7DD3FC", "#38BDF8"];
        } else if (key.includes("clear")) {
            theme = "clear";
            colors = ["#7DD3FC", "#38BDF8"];
        }

        return { theme, colors, isNight };
    }
}

export default WeatherService;
