import mapboxgl from "mapbox-gl"

// Mock mapbox-gl without importing it
jest.mock("mapbox-gl", () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    addControl: jest.fn(),
    remove: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    flyTo: jest.fn(),
    getLayer: jest.fn(),
  })),
  NavigationControl: jest.fn(),
}))

import * as mapModule from "../public/map"

describe("map.js tests", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="start-map"></div>'
    fetch.resetMocks()
  })

  test("initializeMap initializes the map correctly", () => {
    mapModule.initializeMap()

    // Check if mapboxgl.Map has been called correctly
    expect(mapboxgl.Map).toHaveBeenCalledWith({
      container: "start-map", // The ID of the map container
      style: "mapbox://styles/mapbox/streets-v11", // Map style to use
      center: [-2.79902, 56.33871], // Starting position [lng, lat]
      zoom: 9, // Starting zoom level
    })

    // Check if the addControl method was called to add navigation controls
    expect(mapModule.map.addControl).toHaveBeenCalledWith(
      expect.any(mapboxgl.NavigationControl) // This checks that a NavigationControl instance was passed
    )
  })

  // Other test cases...
})
