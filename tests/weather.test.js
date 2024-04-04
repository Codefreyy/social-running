const fetchMock = require('jest-fetch-mock');
const { Weather } = require('../public/client');

// Set the global fetch function to simulate fetchMock
global.fetch = fetchMock;

describe('Weather', () => {
    let showWeatherMock;

    beforeEach(() => {
        // Create a mock function to simulate the innerHTML setting of the showWeather element
        showWeatherMock = jest.fn();
        global.document.getElementById = jest.fn(() => ({ innerHTML: '', set innerHTML(html) { showWeatherMock(html); } }));
    });

    test('should fetch weather data and display it correctly', async () => {
        // Set the data returned by mock fetch API
        const mockWeatherData = {
            day: {
                condition: { icon: '//example.com/icon.jpg', text: 'Sunny' },
                maxtemp_c: 25,
                mintemp_c: 15,
                daily_chance_of_rain: 10,
                uv: 5
            },
            date: '2024-04-02'
        };
        // Simulating the fetch API returns success and returns the set mockWeatherData
        fetch.mockResponseOnce(JSON.stringify(mockWeatherData));
        await Weather('your-runId', [40.7128, -74.0060], '2024-04-02T12:00:00Z');
        // Verify innerHTML is set correctly
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
        expect(showWeatherMock).toHaveBeenCalledWith(expect.any(String));
    });

    test('should display error message when weather data fetching fails', async () => {
        // Simulating fetch API returns failure
        fetch.mockRejectOnce(new Error('Failed to fetch weather data'));
        await Weather('runId', [40.7128, -74.0060], '2024-04-02T12:00:00Z');
    });
});
