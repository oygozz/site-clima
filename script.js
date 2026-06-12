const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const weatherResult = document.getElementById("weatherResult");


const apiKey = "588d699a40d96e905a4a36a7ebd97736";

function searchCity() {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = `
            <p>⚠️ Digite o nome de uma cidade.</p>
        `;
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
        weatherResult.innerHTML = `
            <p>⚠️ Seu navegador não suporta localização.</p>
        `;
        return;
    }

    weatherResult.innerHTML = `<p>📍 Pegando sua localização...</p>`;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log("Latitude:", lat);
            console.log("Longitude:", lon);

            getWeatherByCoords(lat, lon);
        },
        (error) => {
            console.log("Erro de localização:", error);

       if (error.code === 1) {
    weatherResult.innerHTML = `
        <p>⚠️ Você negou a permissão de localização.</p>
    `;
} else if (error.code === 2) {
    weatherResult.innerHTML = `
        <p>⚠️ Não foi possível determinar sua localização.</p>
    `;
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
            weatherResult.innerHTML = `
                <p>⚠️ Cidade não encontrada. Tente digitar o nome completo ou uma cidade próxima.</p>
            `;
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
            weatherResult.innerHTML = `
                <p>⚠️ ${data.message}</p>
            `;
            return;
        }

        const icon = data.weather[0].icon;
const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        weatherResult.innerHTML = `
            <h2>${cityName} - ${state}</h2>

            <img src="${iconUrl}" alt="Ícone do clima" class="weather-icon">

            <p class="temp">${Math.round(data.main.temp)}°C</p>
            <p>${data.weather[0].description}</p>
            <p>Sensação: ${Math.round(data.main.feels_like)}°C</p>
            <p>Umidade: ${data.main.humidity}%</p>
            <p>Vento: ${data.wind.speed} m/s</p>
        `;

    } catch (error) {
        console.error(error);

        weatherResult.innerHTML = `
            <p>❌ Erro ao buscar o clima.</p>
        `;
    }
}
async function getWeatherByCoords(lat, lon) {
    weatherResult.innerHTML = `<p>Buscando clima...</p>`;

    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;

        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            weatherResult.innerHTML = `
                <p>⚠️ ${data.message}</p>
            `;
            return;
        }

        const icon = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        weatherResult.innerHTML = `
            <h2>${data.name}</h2>

            <img src="${iconUrl}" alt="Ícone do clima" class="weather-icon">

            <p class="temp">${Math.round(data.main.temp)}°C</p>
            <p>${data.weather[0].description}</p>
            <p>Sensação: ${Math.round(data.main.feels_like)}°C</p>
            <p>Umidade: ${data.main.humidity}%</p>
            <p>Vento: ${data.wind.speed} m/s</p>
        `;

    } catch (error) {
        console.error(error);

        weatherResult.innerHTML = `
            <p>❌ Erro ao buscar o clima pela localização.</p>
        `;
    }
}
