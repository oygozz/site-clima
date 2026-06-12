const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const weatherResult = document.getElementById("weatherResult");

const apiKey = "588d699a40d96e905a4a36a7ebd97736";

function searchCity() {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = `<p>⚠️ Digite o nome de uma cidade.</p>`;
        return;
    }

    getWeather(city);
}

searchButton.addEventListener("click", searchCity);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchCity();
    }
});

locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        weatherResult.innerHTML = `<p>⚠️ Seu navegador não suporta localização.</p>`;
        return;
    }

    weatherResult.innerHTML = `<p>📍 Pegando sua localização...</p>`;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getWeatherByCoords(lat, lon);
        },
        (error) => {
            if (error.code === 1) {
                weatherResult.innerHTML = `<p>⚠️ Você negou a permissão de localização.</p>`;
            } else if (error.code === 2) {
                weatherResult.innerHTML = `<p>⚠️ Não foi possível determinar sua localização.</p>`;
            } else if (error.code === 3) {
                weatherResult.innerHTML = `
                    <p>⚠️ O GPS demorou para responder.</p>
                    <p>Digite sua cidade manualmente para obter o clima.</p>
                `;
            }
        },
        {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000
        }
    );
});

async function getWeather(city) {
    weatherResult.innerHTML = `<p>Buscando clima...</p>`;

    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city},BR&limit=5&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            weatherResult.innerHTML = `<p>⚠️ Cidade não encontrada. Tente digitar o nome completo ou uma cidade próxima.</p>`;
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const cityName = geoData[0].name;
        const state = geoData[0].state || "Brasil";

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const data = await weatherResponse.json();

        if (data.cod !== 200) {
            weatherResult.innerHTML = `<p>⚠️ ${data.message}</p>`;
            return;
        }

        showWeather(data, `${cityName} - ${state}`, lat, lon);
    } catch (error) {
        console.error(error);
        weatherResult.innerHTML = `<p>❌ Erro ao buscar o clima.</p>`;
    }
}

async function getWeatherByCoords(lat, lon) {
    weatherResult.innerHTML = `<p>Buscando clima...</p>`;

    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            weatherResult.innerHTML = `<p>⚠️ ${data.message}</p>`;
            return;
        }

        showWeather(data, data.name, lat, lon);
    } catch (error) {
        console.error(error);
        weatherResult.innerHTML = `<p>❌ Erro ao buscar o clima pela localização.</p>`;
    }
}

function showWeather(data, title, lat, lon) {
    changeBackground(data.weather[0].main, data.main.temp);


    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherResult.innerHTML = `
        <h2>${title}</h2>

        <img src="${iconUrl}" alt="Ícone do clima" class="weather-icon">

        <p class="temp">${Math.round(data.main.temp)}°C</p>
        <p>${data.weather[0].description}</p>
        <p>Sensação: ${Math.round(data.main.feels_like)}°C</p>
        <p>Umidade: ${data.main.humidity}%</p>
        <p>Vento: ${data.wind.speed} m/s</p>

        <div id="forecast" class="forecast"></div>
    `;

    getForecast(lat, lon);
}

async function getForecast(lat, lon) {
    const forecastContainer = document.getElementById("forecast");

    try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
        const response = await fetch(forecastUrl);
        const data = await response.json();

        if (data.cod !== "200") {
            forecastContainer.innerHTML = `<p>⚠️ Não foi possível carregar a previsão.</p>`;
            return;
        }

        const dailyForecasts = data.list.filter((item) => {
            return item.dt_txt.includes("12:00:00");
        });

        forecastContainer.innerHTML = `
            <h3>Previsão para 5 dias</h3>

            <div class="forecast-list">
                ${dailyForecasts.map((item) => {
                    const date = new Date(item.dt_txt);

                    const day = date.toLocaleDateString("pt-BR", {
                        weekday: "short"
                    });

                    const icon = item.weather[0].icon;
                    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

                    return `
                        <div class="forecast-card">
                            <p>${day}</p>
                            <img src="${iconUrl}" alt="Ícone do clima">
                            <strong>${Math.round(item.main.temp)}°C</strong>
                            <small>${item.weather[0].description}</small>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    } catch (error) {
        console.error(error);
        forecastContainer.innerHTML = `<p>❌ Erro ao carregar previsão.</p>`;
    }
}
function changeBackground(weatherMain, temp) {
    document.body.classList.remove(
        "clear",
        "clouds",
        "rain",
        "storm",
        "mist",
        "hot",
        "default-weather"
    );

    if (weatherMain === "Rain" || weatherMain === "Drizzle") {
        document.body.classList.add("rain");
    } else if (weatherMain === "Thunderstorm") {
        document.body.classList.add("storm");
    } else if (weatherMain === "Mist" || weatherMain === "Fog" || weatherMain === "Haze") {
        document.body.classList.add("mist");
    } else if (temp >= 30) {
        document.body.classList.add("hot");
    } else if (weatherMain === "Clear") {
        document.body.classList.add("clear");
    } else if (weatherMain === "Clouds") {
        document.body.classList.add("clouds");
    } else {
        document.body.classList.add("default-weather");
    }
}