import React, { useState, useEffect } from "react";
import "./styles.css";

const API_KEY = "651f5647372f353e90f422cd2e9d3a4a";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

function App() {
  const [city, setCity] = useState("Nairobi");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recentCities, setRecentCities] = useState(
    JSON.parse(localStorage.getItem("recentCities")) || []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme on start
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
  }, []);

  // Save theme when it changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line
  }, []);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);
      setForecast([]);

      const weatherRes = await fetch(
        `${BASE_URL}weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!weatherRes.ok) throw new Error("City not found");
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(
        `${BASE_URL}forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData.list);
      saveRecentCity(cityName);
      setCity(cityName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentCity = (cityName) => {
    let updated = [cityName, ...recentCities.filter((c) => c !== cityName)];
    if (updated.length > 5) updated = updated.slice(0, 5);
    setRecentCities(updated);
    localStorage.setItem("recentCities", JSON.stringify(updated));
  };

  const groupForecastByDay = () => {
    const daily = {};
    forecast.forEach((item) => {
      const date = new Date(item.dt_txt).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (!daily[date]) {
        daily[date] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon,
        };
      } else {
        daily[date].min = Math.min(daily[date].min, item.main.temp_min);
        daily[date].max = Math.max(daily[date].max, item.main.temp_max);
      }
    });
    return Object.entries(daily).slice(0, 5);
  };

  return (
    <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}>
      <header>
        <h1>🌤 Weather Dashboard</h1>
        <div className="search-container">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
          />
          <button onClick={() => fetchWeather(city)}>Search</button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const { latitude, longitude } = pos.coords;
                  const res = await fetch(
                    `${BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                  );
                  const data = await res.json();
                  fetchWeather(data.name);
                });
              }
            }}
          >
            📍 Use My Location
          </button>

          {/* Sliding Toggle */}
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="theme-toggle"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <label htmlFor="theme-toggle">
              <span className="switch"></span>
            </label>
          </div>
        </div>

        <div className="recent-searches">
          {recentCities.map((c) => (
            <div key={c} className="recent-city" onClick={() => fetchWeather(c)}>
              {c}
            </div>
          ))}
        </div>
      </header>

      <main>
        <div className="dashboard-grid">
          <section id="current-weather">
            <h2>Current Weather</h2>
            {loading ? (
              <div className="spinner"></div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : weather ? (
              <div className="weather-main">
                <div className="weather-info">
                  <p className="temperature">{Math.round(weather.main.temp)}°C</p>
                  <p className="condition">{weather.weather[0].description}</p>
                  <p>🌡 Feels like: {Math.round(weather.main.feels_like)}°C</p>
                  <p>💧 Humidity: {weather.main.humidity}%</p>
                  <p>💨 Wind: {weather.wind.speed} m/s</p>
                </div>
                <img
                  id="weather-icon"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="Weather icon"
                />
              </div>
            ) : null}
          </section>

          <section id="forecast">
            <h2>5-Day Forecast</h2>
            <div id="forecast-container">
              {groupForecastByDay().map(([day, info]) => (
                <div key={day} className="forecast-day">
                  <h4>{day}</h4>
                  <img
                    src={`https://openweathermap.org/img/wn/${info.icon}@2x.png`}
                    alt=""
                  />
                  <p>
                    <strong>{Math.round(info.max)}°C</strong> / {Math.round(info.min)}°C
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>🌍 Powered by OpenWeather | Built with ❤️</p>
        <p>©️ 2025 Phikani Ishmael Mavundla</p>
      </footer>
    </div>
  );
}

export default App;
