//
// NDVI TIME SERIES ANALYSIS USING SENTINEL-2 (GEE)
// CLOUD-MASKED VEGETATION MONITORING PIPELINE
// ROI-BASED AGRICULTURAL VEGETATION TREND EXTRACTION
// AUTHOR: Remote Sensing + GIS Workflow (2023 DATA)
//


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



//ZONAL STATISTICS
var zonalStats = ndviCollection.map(function(img) {

 var stats = img.select('NDVI').reduceRegion({
   reducer: ee.Reducer.mean(),
   geometry: roi,
   scale: 10,
   maxPixels: 1e9
 });

 return ee.Feature(null, {
   'date': img.date().format('YYYY-MM-dd'),
   'NDVI': stats.get('NDVI')
 });
});

//CREATE TIME SERIES STRUCTURE
var timeSeries = ee.FeatureCollection(zonalStats);
print(timeSeries.aggregate_array('NDVI'));


//Vizualization
print(ui.Chart.feature.byFeature(zonalStats, 'date', 'NDVI'));

