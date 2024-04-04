export async function Weather(runId, startPointCoords, startTime) {
  // Format startTime as YYYY-MM-DD
  const date = new Date(startTime)
  const targetDate = date.toISOString().split("T")[0]
  const url = `/weather?runId=${runId}&lat=${startPointCoords[0]}&lon=${startPointCoords[1]}&startTime=${targetDate}`
  try {
    const response = await fetch(url)
    const weatherData = await response.json()
    const showWeather = document.getElementById("weather")
    // If weatherData exists and contains the day attribute, it means that we have weather data for a specific day.
    if (weatherData && weatherData.day) {
      const weatherInfo = weatherData.day
      showWeather.innerHTML = `
          <h3>Weather Forecast for ${weatherData.date}</h3>
          <img src="https:${weatherInfo.condition.icon}" alt="${weatherInfo.condition.text}">
          <p>Max Temperature: ${weatherInfo.maxtemp_c}°C</p>
          <p>Min Temperature: ${weatherInfo.mintemp_c}°C</p>
          <p>Condition: ${weatherInfo.condition.text}</p>
          <p>Chance of Rain: ${weatherInfo.daily_chance_of_rain}%</p>
          <p>UV Index: ${weatherInfo.uv}</p>
        `
    } else {
      showWeather.innerHTML = `<p>Sorry, we can only predict the weather within 15 days.</p>`
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
  }
}
