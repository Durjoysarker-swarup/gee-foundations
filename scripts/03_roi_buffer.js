// ROI + Buffer Analysis (Spatial Operations)
// Location: Sylhet, Bangladesh (91.8, 24.9)
// Operations: point ROI, buffer expansion & contraction
// Output: area comparison of original, expanded, and reduced regions

// Define ROI
var roi = ee.Geometry.Point([91.8, 24.9]).buffer(1000);
Map.centerObject(roi, 12);
Map.addLayer(roi, {color: 'red'}, 'ROI');

// Apply Buffers
var expand = roi.buffer(500);
var shrink = roi.buffer(-300);

Map.addLayer(expand, {color: 'blue'}, 'Expanded');
Map.addLayer(shrink, {color: 'green'}, 'Shrinked');

// Compare Area
print('Original area', roi.area());
print('Expanded area', expand.area());
print('Shrinked area', shrink.area());
