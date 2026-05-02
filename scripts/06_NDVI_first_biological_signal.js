// Define ROI
var roi = ee.Geometry.Rectangle([91.7, 24.7, 92.0, 25.0]);
Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI Boundary');

// Load Data
var collection = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31')
  .select(['B4', 'B8','SCL']);

// Cloud Masking
function maskS2(image) {
 var scl = image.select('SCL');

 var mask = scl.neq(3) // cloud shadow
   .and(scl.neq(8))    // medium cloud
   .and(scl.neq(9))    // high cloud
   .and(scl.neq(10))   // cirrus
   .and(scl.neq(11));  // snow

 return image.updateMask(mask);
}
//Apply it
var cleanCollection = collection.map(maskS2);


//Median Reduction
var medianImage = cleanCollection.median().clip(roi);

//NDVI calculation
var ndvi = medianImage.normalizedDifference(['B8', 'B4']).rename('NDVI');

//Visualization
var ndviVis = {
 min: -1,
 max: 1,
 palette: ['blue', 'white', 'green']
};

Map.addLayer(ndvi, ndviVis, 'NDVI');

//Histogram 
var stats = ndvi.reduceRegion({
 reducer: ee.Reducer.histogram(),
 geometry: roi,
 scale: 10,
 maxPixels: 1e9
});

print(stats);


// NDVI HISTOGRAM PLOT (GRAPH)
var chart = ui.Chart.image.histogram({
  image: ndvi,
  region: roi,
  scale: 20,
  minBucketWidth: 0.01,
  maxPixels: 1e13,
});

chart.setOptions({
  title: 'NDVI Histogram (Vegetation Distribution)',
  hAxis: {title: 'NDVI Value'},
  vAxis: {title: 'Pixel Count'},
  colors: ['green']
});

print(chart);



