const apiKey = "API_KEY";

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    getWeather(city);
  }
});

async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    document.getElementById("city-name").textContent = data.name;
    document.getElementById("temperature").textContent = data.main.temp;
    document.getElementById("condition").textContent = data.weather[0].description;
    document.getElementById("weather-icon").src = 
      `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}
