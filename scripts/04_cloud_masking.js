// Sentinel-2 Cloud Masking + NDVI Pipeline
// ROI: Sylhet, Bangladesh (Rectangle 91.7–92.0, 24.7–25.0)
// Dataset: Sentinel-2 SR Harmonized (Jun–Sep 2023)
// Steps: raw composite, QA60 cloud masking, median filtering, NDVI comparison
// Output: masked vs unmasked NDVI + pixel loss statistics


// DEFINE ROI
var roi = ee.Geometry.Rectangle([91.7, 24.7, 92.0, 25.0]); // Sylhet region

Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI');

// LOAD SENTINEL-2 SR
var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(roi)
  .filterDate('2023-06-01', '2023-09-30')
  .select(['B2','B3','B4','B8','QA60']) // load the band which I required
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 80));
  
  
// VISUALIZE RAW IMAGE (NO MASKING)
var rawImage = collection.median().clip(roi);  // Order maters first median then clip

var visParams = {
 bands: ['B4', 'B3', 'B2'],
 min: 0,
 max: 3000
};

Map.addLayer(rawImage, visParams, 'RAW IMAGE (NO MASK)');

// CLOUD MASK FUNCTION (QA60)
function maskClouds(image) {
 var qa = image.select('QA60');

 var cloudBitMask = 1 << 10;
 var cirrusBitMask = 1 << 11;

 var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
              .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

 return image.updateMask(mask);
}

// APPLY MASK TO COLLECTION
var maskedCollection = collection.map(maskClouds);

// MASKED IMAGE (WITHOUT MEDIAN)
var maskedImage = maskedCollection.first().clip(roi);

Map.addLayer(maskedImage, visParams, 'MASKED SINGLE IMAGE');

//MASKED + MEDIAN
var cleanImage = maskedCollection.median().clip(roi);

Map.addLayer(cleanImage, visParams, 'MASKED + MEDIAN');

// NVDI function
function addNDVI(image) {
 var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
 return image.addBands(ndvi);
}

// NDVI WITHOUT MASKING
var rawNDVI = rawImage.normalizedDifference(['B8', 'B4']).rename('NDVI');

Map.addLayer(rawNDVI, {
 min: 0,
 max: 1,
 palette: ['white', 'green']
}, 'NDVI (NO MASK)');

// NDVI WITH MASKING
var cleanNDVI = cleanImage.normalizedDifference(['B8', 'B4']).rename('NDVI');

Map.addLayer(cleanNDVI, {
 min: 0,
 max: 1,
 palette: ['white', 'green']
}, 'NDVI (MASKED + MEDIAN)');


// COMPARE STATISTICS
var rawStats = rawNDVI.reduceRegion({
 reducer: ee.Reducer.mean(),
 geometry: roi,
 scale: 10,
 maxPixels: 1e9
});

var cleanStats = cleanNDVI.reduceRegion({
 reducer: ee.Reducer.mean(),
 geometry: roi,
 scale: 10,
 maxPixels: 1e9
});

print('Raw NDVI Mean:', rawStats);
print('Clean NDVI Mean:', cleanStats);


//PIXEL LOSS ANALYSIS 
var maskFraction = cleanImage.mask().reduceRegion({
 reducer: ee.Reducer.mean(),
 geometry: roi,
 scale: 10,
 maxPixels: 1e9
});

print('Remaining Pixel Fraction:', maskFraction);

