document.getElementById('weatherForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const city = document.getElementById('cityInput').value;
    const apiKey = 'b6bd690eb2fdf90ad13f332187e0b693';  // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                alert('City not found. Please try again.');
            } else {
                document.getElementById('weatherResult').style.display = 'block';
                document.getElementById('cityName').textContent = data.name;
                document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
                document.getElementById('description').textContent = `Weather: ${data.weather[0].description}`;
                document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
                document.getElementById('wind').textContent = `Wind Speed: ${data.wind.speed} m/s`;

                const lat = data.coord.lat;
                const lon = data.coord.lon;

                // Correct One Call API URL
                const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API key}`;

                console.log(`Fetching One Call API: ${oneCallUrl}`);

                fetch(oneCallUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(oneCallData => {
                        console.log('One Call API Data:', oneCallData);

                        // Display hourly weather
                        displayHourlyWeather(oneCallData.hourly);

                        // Display daily weather (Next 7 days)
                        displayDailyWeather(oneCallData.daily);

                        // Display yesterday's weather
                        const yesterdayTime = oneCallData.current.dt - 86400;
                        displayYesterdayWeather(oneCallData, yesterdayTime);
                    })
                    .catch(error => {
                        console.error('Error while fetching detailed weather data:', error); 
                        alert('An error occurred while fetching detailed weather data. Please try again.');
                    });
            }
        })
        .catch(error => {
            console.error('Error fetching initial weather data:', error); 
            alert('An error occurred. Please try again.');
        });
});

function displayHourlyWeather(hourlyData) {
    const hourlyContainer = document.getElementById('hourlyWeather');
    hourlyContainer.innerHTML = ''; // Clear previous data
    for (let i = 0; i < 5; i++) {
        const hour = hourlyData[i];
        const hourElement = document.createElement('div');
        hourElement.textContent = `Time: ${new Date(hour.dt * 1000).getHours()}:00 - Temp: ${hour.temp}°C`;
        hourlyContainer.appendChild(hourElement);
    }
}

function displayDailyWeather(dailyData) {
    const dailyContainer = document.getElementById('dailyWeather');
    dailyContainer.innerHTML = ''; // Clear previous data
    dailyData.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.textContent = `Day ${index + 1}: Temp: ${day.temp.day}°C - ${day.weather[0].description}`;
        dailyContainer.appendChild(dayElement);
    });
}

function displayYesterdayWeather(oneCallData, yesterdayTime) {
    const yesterdayWeather = oneCallData.hourly.find(hour => hour.dt === yesterdayTime);
    if (yesterdayWeather) {
        const yesterdayContainer = document.getElementById('yesterdayWeather');
        yesterdayContainer.textContent = `Yesterday's Temp: ${yesterdayWeather.temp}°C - ${yesterdayWeather.weather[0].description}`;
    }
}
