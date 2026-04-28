// Sentinel-2 ROI-based preprocessing workflow
// Includes SCL cloud/shadow masking and pixel-level filtering
// Generates clean median composite for analysis
// Applied to Sylhet region using Google Earth Engine


// Load Sentinel-2 SR
var roi = ee.Geometry.Rectangle([91.7, 24.7, 92.0, 25.0]); // Sylhet region

Map.centerObject(roi, 10);
Map.addLayer(roi, {color: 'red'}, 'ROI');

var collection = ee.ImageCollection('COPERNICUS/S2_SR')
 .filterBounds(roi)
 .filterDate('2023-06-01', '2023-06-30')
 .select(['B2','B3','B4','B8','SCL']);

print('Collection size:', collection.size());


//Pick ONE image
var image = collection.first();


//Visualize RGB
var clippedImage = image.clip(roi); //clip give the RGB image of the ROI

Map.centerObject(roi, 10);

Map.addLayer(clippedImage, {
  bands: ['B4','B3','B2'],
  min: 0,
  max: 3000
}, 'RGB Clipped');

//Visualize SCL
Map.addLayer(image.select('SCL').clip(roi), {
 min: 0,
 max: 11,
 palette: [
   'black',      // 0 no data
   'red',        // 1 saturated
   'darkgray',   // 2 dark area
   'brown',      // 3 shadow
   'green',      // 4 vegetation
   'yellow',     // 5 bare soil
   'blue',       // 6 water
   'lightgray',  // 7 cloud low
   'gray',       // 8 cloud medium
   'white',      // 9 cloud high
   'cyan',       // 10 cirrus
   'pink'        // 11 snow
 ]
}, 'SCL Map');



//Create mask condition
function maskSCL(image) {
 var scl = image.select('SCL');

 var mask = scl.neq(3)   // shadow
   .and(scl.neq(7))      // low cloud
   .and(scl.neq(8))      // medium cloud
   .and(scl.neq(9))      // high cloud
   .and(scl.neq(10));    // cirrus

 return image.updateMask(mask);
}


//Apply mask to collection
var maskedCollection = collection.map(maskSCL);


//Visualize result
var maskedImage = maskedCollection.first();

Map.addLayer(maskedImage.clip(roi), {
 bands: ['B4','B3','B2'],
 min: 0,
 max: 3000
}, 'Masked RGB');

//Compare BEFORE vs AFTER(the Masked RGB vs RGB clipped)


//Median apply
var masked = collection.map(maskSCL);

var medianImage = masked.median().clip(roi);

Map.addLayer(medianImage, {
  bands: ['B4','B3','B2'],
  min: 0,
  max: 3000
}, 'Median Composite');















