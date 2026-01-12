import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", ( _, res) => {
    res.render("index", {weather: null, forecast:null, error: null});
});

app.post("/weather", async(req, res) => {
    let city = req.body.city;

    if (!city) {
        return res.render("index", {
            weather: null,
            forecast: null,
            error: "Please enter a city name"
        });
    } 
    city = city.trim();
    try {
        const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
                q: city,
                units: "metric",
                appid: process.env.API_KEY
            }
        });
        const data = response.data;

        const weather = {
            city: data.name,
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            sunrise:  new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            main: data.weather[0].main.toLowerCase()
        };

        const forecastResponse = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
            params: {
                q: city,
                units: "metric",
                appid: process.env.API_KEY
            }
        });

        const forecastData = forecastResponse.data.list;

        const forecastMap = {};
        forecastData.forEach(item => {
            const date = item.dt_txt.split(" ")[0];

            if(!forecastMap[date]) {
                forecastMap[date] = {
                date,
                temp: item.main.temp,
                description: item.weather[0].description,
                icon: item.weather[0].icon
                }
            };
        
        });

        const forecast = Object.values(forecastMap).slice(0, 5);

        res.render("index", {weather, forecast, error: null});
    } catch (err) {

        res.render("index", {
            weather: null,
            forecast: null,
            error: "City not found"
        });
    }
});
 app.get("/weather/location", async(req, res) => {
            const { lat, lon } = req.query;

            if(!lat || !lon) {
                return res.render("index", {
                    weather: null,
                    forecast: null,
                    error: "Location not available"
                });
            }

            try {
                const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
                    params: {
                        lat,
                        lon,
                        units: "metric",
                        appid: process.env.API_KEY

                    }
                });

                const data = response.data;

                const weather = {
                    city: data.name,
                    temp: data.main.temp,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    sunrise:  new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                res.render("index", {
                    weather,
                    forecast: null,
                    error: null
                });
            } catch (err) {
                res.render("index", {
                    weather: null,
                    forecast: null,
                    error: "Could not get weather for your location"
                });
            }
        });

app.listen(PORT, () =>{
    console.log('Server running on http://localhost:${PORT}');
});