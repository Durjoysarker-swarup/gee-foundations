// GEE Basics: Sentinel-2 Data Exploration
// ROI: Sylhet, Bangladesh (91.8, 24.9)
// Tasks: filter dataset, inspect time series, check cloud stats, visualize bands
// Dataset: COPERNICUS/S2_SR

// Point the Region of Interest
var roi = ee.Geometry.Point([91.8, 24.9]); // Sylhet
Map.centerObject(roi, 10);

// Command to collect the dataset
var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31');
  
print(dataset);


// Checking Dataset Properties and Distribution
// Step:1 - Checking time span covarage
var times = dataset.aggregate_array('system:time_start');

var dates = ee.List(times).map(function(t){
  return ee.Date(t).format('YYYY-MM-dd');
});

print(dates);

// Step 2 — Count images per month
var months = ee.List.sequence(1, 12);

var byMonth = months.map(function(m) {
 var filtered = dataset.filter(ee.Filter.calendarRange(m, m, 'month'));
 return filtered.size();
});

print('Images per month:', byMonth);

//Step 3: Check cloud filtering reality
var cloudStats = dataset.aggregate_array('CLOUDY_PIXEL_PERCENTAGE');
print(cloudStats);



// Take one image and Metadata
var image = dataset.first()
print(image); //This is wrong for analysis. it may be cloudy, off season and randomly ordered



//Inspects Band
print(image.bandNames());

//Visualize the band
Map.addLayer(image.select('B4'), {min:0, max:3000}, 'Red');
Map.addLayer(image.select('B8'), {min:0, max:3000}, 'NIR');


//Detailed Metadata
print("this is detailed metadata")
print(image.getInfo());

// Projection and Scale
print(image.select('B4').projection());

// RGB visualization
Map.addLayer(image, {
 bands: ['B4', 'B3', 'B2'],
 min: 0,
 max: 3000
}, 'RGB Image');





