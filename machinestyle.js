
// ==============================
// API SETUP
// ==============================

const API_KEY = "d99f3251367b7d8d5871e9a8ebead46d";


// ==============================
// GET HTML ELEMENTS
// ==============================

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("city");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

const favorites = document.getElementById("favorites");
const addFavorite = document.getElementById("addFavorite");

const themeToggle = document.getElementById("themeToggle");


// ==============================
// VARIABLES
// ==============================

let currentCity = "";

let favoriteCities =
    JSON.parse(localStorage.getItem("favorites")) || [];


// ==============================
// WEATHER SEARCH
// ==============================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        error.textContent = "Please enter a city name.";
        return;
    }

    currentCity = city;

    getWeather(city);

});


// ==============================
// GET CURRENT WEATHER
// ==============================

async function getWeather(city) {

    loading.style.display = "block";
    error.textContent = "";

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        displayCurrentWeather(data);

        getForecast(city);

    } catch (err) {

        error.textContent = err.message;

        currentWeather.innerHTML = `
            <h3>Current Weather</h3>
        `;

        forecast.innerHTML = `
            <h3>5-Day Forecast</h3>
        `;

    } finally {

        loading.style.display = "none";

    }

}


// ==============================
// DISPLAY CURRENT WEATHER
// ==============================

function displayCurrentWeather(data) {

    currentWeather.innerHTML = `

        <h3>Current Weather</h3>

        <h2>${data.name}</h2>

        <p>Temperature: ${data.main.temp} °C</p>

        <p>Feels Like: ${data.main.feels_like} °C</p>

        <p>Weather: ${data.weather[0].description}</p>

        <p>Humidity: ${data.main.humidity}%</p>

        <p>Wind Speed: ${data.wind.speed} m/s</p>

        <button id="addFavorite">
            Add to Favorites
        </button>

    `;

    document
        .getElementById("addFavorite")
        .addEventListener("click", addCityToFavorites);

}


// ==============================
// GET 5-DAY FORECAST
// ==============================

async function getForecast(city) {

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Forecast not available");
        }

        const data = await response.json();

        displayForecast(data);

    } catch (err) {

        error.textContent = err.message;

    }

}


// ==============================
// DISPLAY FORECAST
// ==============================

function displayForecast(data) {

    forecast.innerHTML = `
        <h3>5-Day Forecast</h3>
    `;

    // OpenWeatherMap gives data every 3 hours.
    // We take one forecast for each day.

    const dailyForecast = data.list.filter(function(item) {

        return item.dt_txt.includes("12:00:00");

    });

    dailyForecast.forEach(function(day) {

        const card = document.createElement("div");

        card.innerHTML = `

            <h4>${day.dt_txt.split(" ")[0]}</h4>

            <p>${day.main.temp} °C</p>

            <p>${day.weather[0].description}</p>

            <p>Humidity: ${day.main.humidity}%</p>

        `;

        forecast.appendChild(card);

    });

}


// ==============================
// ADD FAVORITE
// ==============================

function addCityToFavorites() {

    if (favoriteCities.includes(currentCity)) {

        error.textContent = "City is already in favorites.";

        return;
    }

    favoriteCities.push(currentCity);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favoriteCities)
    );

    displayFavorites();

}


// ==============================
// DISPLAY FAVORITES
// ==============================

function displayFavorites() {

    favorites.innerHTML = `
        <h3>Favorites</h3>
    `;

    favoriteCities.forEach(function(city) {

        const favoriteItem = document.createElement("div");

        favoriteItem.innerHTML = `

            <span>${city}</span>

            <button onclick="searchFavorite('${city}')">
                Search
            </button>

            <button onclick="removeFavorite('${city}')">
                Remove
            </button>

        `;

        favorites.appendChild(favoriteItem);

    });

}


// ==============================
// SEARCH FAVORITE
// ==============================

function searchFavorite(city) {

    cityInput.value = city;

    currentCity = city;

    getWeather(city);

}


// ==============================
// REMOVE FAVORITE
// ==============================

function removeFavorite(city) {

    favoriteCities =
        favoriteCities.filter(function(item) {

            return item !== city;

        });

    localStorage.setItem(
        "favorites",
        JSON.stringify(favoriteCities)
    );

    displayFavorites();

}


// ==============================
// DEBOUNCE
// ==============================

function debounce(callback, delay) {

    let timer;

    return function() {

        clearTimeout(timer);

        timer = setTimeout(function() {

            callback();

        }, delay);

    };

}


// ==============================
// DEBOUNCED SEARCH
// ==============================

const debouncedWeatherSearch =
    debounce(function() {

        const city = cityInput.value.trim();

        if (city !== "") {

            currentCity = city;

            getWeather(city);

        }

    }, 500);


// ==============================
// SEARCH WHILE TYPING
// ==============================

cityInput.addEventListener("input", function() {

    debouncedWeatherSearch();

});


// ==============================
// THEME TOGGLE
// ==============================


themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

});



// ==============================
// LOAD SAVED THEME
// ==============================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add("light-theme");

    themeToggle.textContent = "🌙 Dark Mode";

}


// ==============================
// LOAD FAVORITES WHEN PAGE OPENS
// ==============================

displayFavorites();
