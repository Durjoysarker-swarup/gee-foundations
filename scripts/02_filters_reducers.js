// GEE Reducers + NDVI Analysis
// ROI: Sylhet, Bangladesh (91.8, 24.9)
// Dataset: Sentinel-2 SR (filtered by date + cloud < 20%)
// Operations: median, mean composite + NDVI (B8 - B4)
// Output: NDVI comparison (median vs mean)

// Load data
var roi = ee.Geometry.Point([91.8, 24.9]);
Map.centerObject(roi, 10);

var collection = ee.ImageCollection('COPERNICUS/S2_SR')
 .filterBounds(roi)
 .filterDate('2023-01-01', '2023-03-01')
 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

// Apply reducers
var medianImage = collection.median();
var meanImage = collection.mean();

// NDVI Calculation
var ndvi_median = medianImage.normalizedDifference(['B8', 'B4']);
var ndvi_mean = meanImage.normalizedDifference(['B8', 'B4']);

// Display
Map.centerObject(roi, 10);
Map.addLayer(ndvi_median, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI Median');
Map.addLayer(ndvi_mean, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI Mean');


