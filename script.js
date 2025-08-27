const apiKey = "YOUR_API_KEY";

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    getWeather(city);
  }
}

function showLoading() {
  loadingContainer.innerHTML = '<div class="loading">🌀 Loading weather data...</div>';
  hideError();
}

function hideLoading() {
  loadingContainer.innerHTML = '';
}

function showError(message) {
  errorContainer.innerHTML = `<div class="error-message">❌ ${message}</div>`;
  hideLoading();
}

function hideError() {
  errorContainer.innerHTML = '';
}

async function getWeather(city) {
  try {
    showLoading();
    
    // Get API key from config.js
    const apiKey = "651f5647372f353e90f422cd2e9d3a4a";
    
    // Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    
    if (!currentRes.ok) {
      throw new Error(`City "${city}" not found`);
    }
    
    const currentData = await currentRes.json();
    console.log("Current weather data:", currentData); // Debug log
    
    // 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    
    const forecastData = await forecastRes.json();
    console.log("Forecast data:", forecastData); // Debug log
    
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    addToRecentSearches(city);
    
    hideLoading();
    hideError();
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    showError(error.message || "Failed to fetch weather data. Please try again.");
    currentWeatherSection.style.display = 'none';
    forecastSection.style.display = 'none';
  }
}

function displayCurrentWeather(data) {
  document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temperature").textContent = Math.round(data.main.temp);
  document.getElementById("condition").textContent = data.weather[0].description;
  document.getElementById("weather-icon").src = 
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  
  
  document.getElementById("feels-like").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
  document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById("uv-index").textContent = "N/A"; // UV index requires separate API call
  
  currentWeatherSection.style.display = 'block';
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = '';
  
  // Get one forecast per day (every 8th item = 24 hours later)
  const dailyForecasts = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
  
  dailyForecasts.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    
    const forecastDay = document.createElement('div');
    forecastDay.className = 'forecast-day';
    forecastDay.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
      <p>${Math.round(forecast.main.temp)}°C</p>
      <p style="font-size: 0.9rem; opacity: 0.8;">${forecast.weather[0].main}</p>
    `;
    
    forecastContainer.appendChild(forecastDay);
  });
  
  forecastSection.style.display = 'block';
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      (error) => {
        showError("Unable to get your location. Please search manually.");
      }
    );
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const apiKey = "651f5647372f353e90f422cd2e9d3a4a";
    
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    const currentData = await currentRes.json();
    
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    const forecastData = await forecastRes.json();
    
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    addToRecentSearches(currentData.name);
    
    hideLoading();
    hideError();
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    showError("Failed to fetch weather data for your location.");
  }
}

function addToRecentSearches(city) {
  if (!recentSearches.includes(city)) {
    recentSearches.unshift(city);
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    updateRecentSearches();
  }
}

function updateRecentSearches() {
  const recentSearchesContainer = document.getElementById('recent-searches');
  
  if (recentSearches.length === 0) {
    recentSearchesContainer.innerHTML = '<p>No recent searches</p>';
    return;
  }
  
  recentSearchesContainer.innerHTML = recentSearches
    .map(city => `<span class="recent-city" onclick="searchRecentCity('${city}')">${city}</span>`)
    .join('');
}

function searchRecentCity(city) {
  cityInput.value = city;
  getWeather(city);
}