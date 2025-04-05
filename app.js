'use strict';


const API_KEY = 'ad87c9a26b043016ee55e73996d22e7c'; 
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';



const isApiKeyValid = () => {
    return API_KEY && API_KEY.length > 10;
};


const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const errorBox = document.getElementById('error-box');
const loadingIndicator = document.getElementById('loading');
const weatherData = document.getElementById('weather-data');


const cityName = document.getElementById('city-name');
const country = document.getElementById('country');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');


const weatherThemes = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rainy',
    'Drizzle': 'rainy',
    'Thunderstorm': 'stormy',
    'Snow': 'snowy',
    'Mist': 'cloudy',
    'Fog': 'cloudy',
    'Haze': 'cloudy'
};


document.addEventListener('DOMContentLoaded', () => {
    
    if (!verifyDomElements()) {
        console.error('Some DOM elements were not found. Check element IDs.');
        return;
    }
    
    
    weatherForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        
        if (city) {
            fetchWeatherData(city);
        }
    });

    
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        fetchWeatherData(lastCity);
    }
});


 
function verifyDomElements() {
    const elements = [
        weatherForm, cityInput, errorBox, loadingIndicator, weatherData,
        cityName, country, weatherIcon, temperature, weatherDescription,
        feelsLike, humidity, windSpeed, pressure
    ];
    
    const missingElements = elements.filter(el => !el);
    
    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        return false;
    }
    
    return true;
}


async function fetchWeatherData(city) {
    
    showLoading();
    clearError();
    
    
    if (!isApiKeyValid()) {
        console.error('Invalid API key format');
        showError('You need to register for a free API key at OpenWeatherMap.org and update the API_KEY in app.js');
        return;
    }
    
    try {
        console.log(`Fetching weather data for ${city}...`);
        const url = `${API_URL}?q=${city}&units=metric&appid=${API_KEY}`;
        console.log(`Request URL: ${url}`);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        displayWeatherData(data);
        
        
        localStorage.setItem('lastCity', city);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            showError('Network error. This may be due to CORS restrictions. Try running the app on a local server.');
        } else if (error.message.includes('city not found')) {
            showError('City not found. Please check the spelling and try again.');
        } else if (error.message.includes('401')) {
            showError('API key is invalid or expired. Please check your OpenWeatherMap API key.');
        } else {
            showError('Failed to fetch weather data. Please try again later.');
        }
    } finally {
        hideLoading();
    }
}


function displayWeatherData(data) {
    
    cityName.textContent = data.name;
    country.textContent = data.sys.country;
    
    
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    
    setWeatherTheme(data.weather[0].main);
    
    
    weatherData.classList.remove('hidden');
}


function setWeatherTheme(weatherMain) {
   
    document.body.classList.remove(...Object.values(weatherThemes));
    
    
    const themeClass = weatherThemes[weatherMain] || 'cloudy';
    document.body.classList.add(themeClass);
}


function showLoading() {
    loadingIndicator.style.display = 'flex';
    weatherData.classList.add('hidden');
}


function hideLoading() {
    loadingIndicator.style.display = 'none';
}


function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    weatherData.classList.add('hidden');

    hideLoading();
}


function clearError() {
    errorBox.textContent = '';
    errorBox.style.display = 'none';
} 