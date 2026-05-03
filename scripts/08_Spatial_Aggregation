/*
NDVI Time Series Analysis using Google Earth Engine (Sentinel-2 SR)
Study Area: ROI-based agricultural field monitoring
Purpose: Detect vegetation dynamics using mean, median, and std deviation
Author: Remote sensing workflow for crop monitoring and field variability analysis
*/

//Define ROI
var roi = ee.Geometry.Rectangle([91.90, 24.85, 92.10, 25.05]);
Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI Boundary');

//LOAD IMAGE COLLECTION
var collection = ee.ImageCollection('COPERNICUS/S2_SR')
 .filterBounds(roi)
 .filterDate('2023-01-01', '2023-12-31');


// BASIC CLOUD MASKING (SCL-based)
function maskSCL(image) {
  var scl = image.select('SCL');

  var mask = scl.neq(3)   // cloud shadow
    .and(scl.neq(7))      // low probability cloud
    .and(scl.neq(8))      // medium probability cloud
    .and(scl.neq(9))      // high probability cloud
    .and(scl.neq(10))     // high probability cirrus
    .and(scl.neq(11));    // snow/ice (important but often ignored)

  return image.updateMask(mask)
              .copyProperties(image, ["system:time_start"]);
}


// Apply mask
var maskedCollection = collection.map(maskSCL);

//SELECT IMPORTANT BANDS
var collection = maskedCollection.select(['B4', 'B8']);

//COMPUTE NDVI
var ndviCollection = collection.map(function(img) {
 var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
 return img.addBands(ndvi);
});


//Spatial Aggregation
var stats = ndviCollection.map(function(img) {

  var stat = img.select('NDVI').reduceRegion({
    reducer: ee.Reducer.mean()
      .combine(ee.Reducer.median(), '', true)
      .combine(ee.Reducer.stdDev(), '', true),
    geometry: roi,
    scale: 10,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'date': img.date().millis(),
    'mean': stat.get('NDVI_mean'),
    'median': stat.get('NDVI_median'),
    'stdDev': stat.get('NDVI_stdDev')
  });
});


//Convert to FeatureCollection
var fc = ee.FeatureCollection(stats).filter(ee.Filter.notNull(['mean']));


// Chart (GEE Built-in)
var chart = ui.Chart.feature.byFeature(fc, 'date', ['mean', 'median', 'stdDev'])
  .setChartType('LineChart')
  .setOptions({
    title: 'NDVI Time Series',
    hAxis: {
      title: 'Date',
      format: 'YYYY-MM-dd'   // ✅ convert millis → readable date
    },
    vAxis: {title: 'NDVI'},
    lineWidth: 2,
    pointSize: 3
  });

print(chart);

