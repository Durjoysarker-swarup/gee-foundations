// Sentinel-2 NDVI Time-Series Analysis using Google Earth Engine
// Workflow includes SCL-based cloud masking, ROI buffering, NDVI computation, and zonal statistics
// Generates temporal NDVI trends with mean, median, and standard deviation aggregation
// Designed for agricultural vegetation monitoring and spatial-temporal analysis

//DEFINE ROI + Apply buffer
var bufferedROI = ee.Geometry.Rectangle([91.7, 24.7, 92.0, 25.0]).buffer(-200);

Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI');


//LOAD SENTINEL-2
var collection = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 80));



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


//COMPUTE NDVI FOR EACH IMAGE

var ndviCollection = maskedCollection.map(function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4'])
                  .rename('NDVI');
  return ndvi.copyProperties(image, ['system:time_start']);
});


//VISUALIZE ONE NDVI IMAGE
var firstImage = ee.Image(ndviCollection.first());

Map.addLayer(firstImage.clip(roi), {
  min: 0,
  max: 1,
  palette: ['blue', 'white', 'green']
}, 'NDVI clipped');

//EXTRACT ZONAL STATISTICS


var zonalStats = ndviCollection.map(function(image) {

  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: roi,
    scale: 10,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'date': ee.Date(image.get('system:time_start'))
                .format('YYYY-MM-dd'),

    'NDVI': stats.get('NDVI')
  });
});
//CREATE FEATURE COLLECTION
var ndviTimeSeries = ee.FeatureCollection(zonalStats);


//PLOT RAW TIME SERIES
var chart = ui.Chart.feature.byFeature(
    ndviTimeSeries,
    'date',
    'NDVI'
)
.setOptions({
  title: 'Raw NDVI Time Series',
  hAxis: {title: 'Date'},
  vAxis: {title: 'NDVI'},
  pointSize: 4,
  lineWidth: 1
});

print(chart);


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

