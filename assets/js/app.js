const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const dailyForecast = document.getElementById("daily-forecast");
const hourlyForecast = document.getElementById("hourly-forecast");
const searchLoading = document.getElementById("search-loading");
const errorState = document.getElementById("error-state");
const retryBtn = document.getElementById("retry-btn");
const appShell = document.querySelector(".app-shell");

const state = {
  unit: "metric",
  windUnit: "kmh",
  precipUnit: "mm",
  location: "Berlin, Germany",
  weather: {
    current: {
      temperature_2m: 20,
      apparent_temperature: 19,
      relativehumidity_2m: 60,
      windspeed_10m: 10,
      precipitation: 0,
      weathercode: 0,
      time: "2025-08-05T15:00",
    },
    daily: {
      time: [
        "2025-08-05",
        "2025-08-06",
        "2025-08-07",
        "2025-08-08",
        "2025-08-09",
        "2025-08-10",
        "2025-08-11",
      ],
      weathercode: [0, 2, 1, 3, 1, 0, 1],
      temperature_2m_max: [20, 21, 24, 23, 21, 15, 18],
      temperature_2m_min: [14, 15, 14, 15, 13, 16, 15],
    },
    hourly: {
      time: [
        "2025-08-05T15:00",
        "2025-08-05T16:00",
        "2025-08-05T17:00",
        "2025-08-05T18:00",
        "2025-08-05T19:00",
        "2025-08-05T20:00",
        "2025-08-05T21:00",
        "2025-08-05T22:00",
        "2025-08-05T23:00",
        "2025-08-06T00:00",
      ],
      temperature_2m: [20, 20, 20, 19, 18, 18, 17, 17, 16, 15],
      weathercode: [0, 0, 1, 2, 1, 1, 3, 2, 1, 0],
    },
  },
};

const weatherCodes = {
  0: { label: "Clear", icon: "./assets/images/icon-sunny.webp" },
  1: { label: "Mostly clear", icon: "./assets/images/icon-partly-cloudy.webp" },
  2: {
    label: "Partly cloudy",
    icon: "./assets/images/icon-partly-cloudy.webp",
  },
  3: { label: "Overcast", icon: "./assets/images/icon-overcast.webp" },
  45: { label: "Fog", icon: "./assets/images/icon-fog.webp" },
  48: { label: "Rime fog", icon: "./assets/images/icon-fog.webp" },
  51: { label: "Light drizzle", icon: "./assets/images/icon-drizzle.webp" },
  53: { label: "Drizzle", icon: "./assets/images/icon-drizzle.webp" },
  55: { label: "Heavy drizzle", icon: "./assets/images/icon-drizzle.webp" },
  56: { label: "Freezing drizzle", icon: "./assets/images/icon-drizzle.webp" },
  57: {
    label: "Heavy freezing drizzle",
    icon: "./assets/images/icon-drizzle.webp",
  },
  61: { label: "Light rain", icon: "./assets/images/icon-rain.webp" },
  63: { label: "Rain", icon: "./assets/images/icon-rain.webp" },
  65: { label: "Heavy rain", icon: "./assets/images/icon-rain.webp" },
  66: { label: "Freezing rain", icon: "./assets/images/icon-rain.webp" },
  67: { label: "Heavy freezing rain", icon: "./assets/images/icon-rain.webp" },
  71: { label: "Light snow", icon: "./assets/images/icon-snow.webp" },
  73: { label: "Snow", icon: "./assets/images/icon-snow.webp" },
  75: { label: "Heavy snow", icon: "./assets/images/icon-snow.webp" },
  77: { label: "Snow grains", icon: "./assets/images/icon-snow.webp" },
  80: { label: "Rain showers", icon: "./assets/images/icon-rain.webp" },
  81: { label: "Heavy showers", icon: "./assets/images/icon-rain.webp" },
  82: { label: "Violent showers", icon: "./assets/images/icon-rain.webp" },
  85: { label: "Snow showers", icon: "./assets/images/icon-snow.webp" },
  86: { label: "Heavy snow showers", icon: "./assets/images/icon-snow.webp" },
  95: { label: "Thunderstorm", icon: "./assets/images/icon-storm.webp" },
  96: {
    label: "Thunderstorm with hail",
    icon: "./assets/images/icon-storm.webp",
  },
  99: { label: "Severe hail", icon: "./assets/images/icon-storm.webp" },
};

function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function mmToInches(mm) {
  return mm / 25.4;
}

function formatTemp(value) {
  const number = Number(value);
  if (state.unit === "imperial") {
    return `${Math.round(cToF(number))}°`;
  }
  return `${Math.round(number)}°`;
}

function formatWind(value) {
  const speed = Number(value);
  if (state.windUnit === "mph") {
    return `${(speed * 0.621371).toFixed(0)} mph`;
  }
  return `${Math.round(speed)} km/h`;
}

function formatPrecip(value) {
  const amount = Number(value || 0);
  if (state.precipUnit === "in") {
    return `${mmToInches(amount).toFixed(2)} in`;
  }
  return `${Math.round(amount)} mm`;
}

function formatTempShort(value) {
  if (state.unit === "imperial") {
    return `${Math.round(cToF(value))}°`;
  }
  return `${Math.round(value)}°`;
}

function getDateLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getWeatherInfo(code) {
  const match = weatherCodes[code] || weatherCodes[0];
  return match;
}

function updateUnitToggleLabel() {
  const toggleButton = document.querySelector(".settings-panel__toggle");
  if (!toggleButton) return;
  toggleButton.innerHTML = `<span>${state.unit === "metric" ? "Switch to Imperial" : "Switch to Metric"}</span>`;
}

function syncSettingsPanel() {
  // Buttons use `data-type` and `data-value` in the markup. Sync selection
  // state by mapping types to the corresponding state values.
  document.querySelectorAll(".settings-option").forEach((button) => {
    const type = button.dataset.type;
    const value = button.dataset.value;
    if (type === "temp") {
      button.classList.toggle("is-selected", value === state.unit);
    } else if (type === "wind") {
      button.classList.toggle("is-selected", value === state.windUnit);
    } else if (type === "precip") {
      button.classList.toggle("is-selected", value === state.precipUnit);
    }
  });

  updateUnitToggleLabel();
}

function setTemperatureSelect(value) {
  const currentTemp = state.unit;
  if (value === currentTemp) return;
  state.unit = value;
  syncSettingsPanel();
  renderWeather();
}

function setWindSelect(value) {
  state.windUnit = value;
  syncSettingsPanel();
  renderWeather();
}

function setPrecipSelect(value) {
  state.precipUnit = value;
  syncSettingsPanel();
  renderWeather();
}

function setLoadingState(isLoading) {
  searchLoading.classList.toggle("hidden", !isLoading);
  searchBtn.disabled = isLoading;
  searchBtn.style.opacity = isLoading ? "0.8" : "1";
}

function showErrorState() {
  appShell.classList.add("is-error");
  errorState.classList.remove("hidden");
}

function hideErrorState() {
  appShell.classList.remove("is-error");
  errorState.classList.add("hidden");
}

function renderDefaultView() {
  hideErrorState();
  setLoadingState(false);
  renderWeather();
}

function toggleSettingsPanel(forceOpen) {
  const shouldOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !settingsPanel.classList.contains("is-open");
  settingsPanel.classList.toggle("is-open", shouldOpen);
  settingsToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function renderWeather() {
  if (!state.weather || !state.weather.current) return;

  // ensure expected DOM elements exist before mutating
  const requiredIds = [
    "current-temp",
    "current-degree-sign",
    "current-unit-label",
    "current-location",
    "current-date",
    "current-icon",
    "feels-like",
    "humidity",
    "wind",
    "precip",
  ];

  for (const id of requiredIds) {
    if (!document.getElementById(id)) {
      console.warn("renderWeather missing DOM element:", id);
      return;
    }
  }

  const { current, daily, hourly } = state.weather;
  const currentCode = current.weathercode;
  const currentInfo = getWeatherInfo(currentCode);
  const tempValue =
    state.unit === "imperial"
      ? cToF(current.temperature_2m)
      : current.temperature_2m;
  const feelsLikeValue =
    state.unit === "imperial"
      ? cToF(current.apparent_temperature)
      : current.apparent_temperature;
  const windValue = current.windspeed_10m ?? 0;
  const precipValue = current.precipitation ?? 0;

  document.getElementById("current-temp").textContent = Math.round(tempValue);
  document.getElementById("current-degree-sign").textContent = "°";
  document.getElementById("current-unit-label").textContent =
    state.unit === "metric" ? "C" : "F";
  document.getElementById("current-location").textContent = state.location;
  document.getElementById("current-date").textContent = new Date(
    current.time,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const currentIcon = document.getElementById("current-icon");
  currentIcon.style.backgroundImage = `url('${currentInfo.icon}')`;
  currentIcon.setAttribute("aria-label", `${currentInfo.label} weather`);

  document.getElementById("feels-like").textContent =
    formatTemp(feelsLikeValue);
  document.getElementById("humidity").textContent =
    `${Math.round(current.relativehumidity_2m ?? 0)}%`;
  document.getElementById("wind").textContent = formatWind(windValue);
  document.getElementById("precip").textContent = formatPrecip(precipValue);

  renderDailyForecast(daily);
  renderHourlyForecast(hourly);
}

function renderDailyForecast(daily) {
  const { time, weathercode, temperature_2m_max, temperature_2m_min } = daily;
  dailyForecast.innerHTML = "";

  time.forEach((date, index) => {
    const day = document.createElement("article");
    day.className = "forecast-day";

    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const code = weathercode[index];
    const icon = getWeatherInfo(code).icon;

    const max =
      state.unit === "imperial"
        ? cToF(temperature_2m_max[index])
        : temperature_2m_max[index];
    const min =
      state.unit === "imperial"
        ? cToF(temperature_2m_min[index])
        : temperature_2m_min[index];

    const dayContent = `
      <span class="forecast-day__day">${dayName}</span>
      <span class="forecast-day__icon" style="background-image: url('${icon}')" aria-label="${getWeatherInfo(code).label}"></span>
      <span class="forecast-day__temps">
        <span class="high">${Math.round(max)}°</span>
        <span class="low">${Math.round(min)}°</span>
      </span>
    `;

    day.innerHTML = dayContent;
    dailyForecast.appendChild(day);
  });
}

function renderHourlyForecast(hourly) {
  const { time, temperature_2m, weathercode } = hourly;
  const nextTwelve = time.slice(0, 10);
  hourlyForecast.innerHTML = "";

  nextTwelve.forEach((stamp, index) => {
    const hourValue = new Date(stamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const temp =
      state.unit === "imperial"
        ? cToF(temperature_2m[index])
        : temperature_2m[index];
    const icon = getWeatherInfo(weathercode[index]).icon;
    const item = document.createElement("div");
    item.className = "hourly-item";

    if (index === 0) {
      item.classList.add("hourly-item--active");
    }

    item.innerHTML = `
      <span class="hourly-item__time">${hourValue.replace(":00", "").replace(":30", "").replace(" ", " ")}</span>
      <span class="hourly-item__icon" style="background-image: url('${icon}')" aria-label="${getWeatherInfo(weathercode[index]).label}"></span>
      <span class="hourly-item__temp">${Math.round(temp)}°</span>
    `;

    hourlyForecast.appendChild(item);
  });
}

async function geocodeLocation(cityName) {
  const searchQuery = encodeURIComponent(cityName);
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=1&language=en&format=json`,
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No matching location was found.");
  }

  return data.results[0];
}

async function fetchWeatherForLocation(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,windspeed_10m,weathercode",
    hourly: "temperature_2m,weathercode",
    daily: "weathercode,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );
  const json = await response.json();

  if (!json.current || !json.daily || !json.hourly) {
    throw new Error("Weather data could not be loaded for this location.");
  }

  return json;
}

async function updateWeatherForCity(cityName, showSpinner = false) {
  try {
    if (showSpinner) {
      setLoadingState(true);
    }
    hideErrorState();
    const location = await geocodeLocation(cityName);
    const weather = await fetchWeatherForLocation(
      location.latitude,
      location.longitude,
    );

    state.location = [location.name, location.country]
      .filter(Boolean)
      .join(", ");
    state.weather = weather;
    renderWeather();
  } catch (error) {
    showErrorState();
  } finally {
    setLoadingState(false);
  }
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;
  updateWeatherForCity(query, true);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    if (!query) return;
    updateWeatherForCity(query, true);
  }
});

settingsToggle.addEventListener("click", () => {
  toggleSettingsPanel();
});

document
  .querySelector(".settings-panel__toggle")
  .addEventListener("click", () => {
    const nextUnit = state.unit === "metric" ? "imperial" : "metric";
    state.unit = nextUnit;
    syncSettingsPanel();
    renderWeather();
  });

// Wire up the option buttons which use `data-type` and `data-value`.
document.querySelectorAll(".settings-option").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;
    if (type === "temp") {
      setTemperatureSelect(value);
    } else if (type === "wind") {
      setWindSelect(value);
    } else if (type === "precip") {
      setPrecipSelect(value);
    }
  });
});

document.addEventListener("click", (event) => {
  if (
    !settingsPanel.contains(event.target) &&
    !settingsToggle.contains(event.target)
  ) {
    toggleSettingsPanel(false);
  }
});

function init() {
  searchInput.value = "Berlin";
  syncSettingsPanel();
  toggleSettingsPanel(false);

  retryBtn.addEventListener("click", () => {
    updateWeatherForCity(searchInput.value.trim() || "Berlin", true);
  });

  renderDefaultView();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
