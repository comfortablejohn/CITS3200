


function area(points) {
  var latlngs = [];

  for(i = 0; i < points.length - 1; i++) {
    latlngs.push(points[i].pos);
  }
  return google.maps.geometry.spherical.computeArea(latlngs);
}

function plotCentroid(points, A) {

  if (!home) {
    alert("set home first");
    return;
  }

  var cx = 0;
  var cy = 0;

  for(i = 1; i < points.length; i++) {
    cx += (points[i - 1].x + points[i].x)*((points[i-1].x*points[i].y) - (points[i].x*points[i-1].y));
    cy += (points[i-1].y + points[i].y)*((points[i-1].x*points[i].y) - (points[i].x*points[i-1].y));
  } 

  cx /= 6*A;
  cy /= 6*A;

  console.log("cx: " + cx + " cy: " + cy);

  ppp = map.getProjection().fromPointToLatLng(new google.maps.Point(cx, cy));

  m = placeMarker(ppp, 'sdf', google.maps.Animation.BOUNCE);

  return;

  theta = Math.atan2(cy,cx);


  d = cy/Math.sin(theta);

  theta = (Math.PI*theta)/180;

  if (cx < 0) heading = -90 + Math.abs(theta);
  else heading = 90 - Math.abs(theta);
  console.log("cx: " + cx + " cy: " + cy + " theta: " + theta + " d: " + d + " heading: " + heading);

  pos = google.maps.geometry.spherical.computeOffset(home, d, heading);
  return pos;
  m = placeMarker(pos, pos.lat() + ', ' + pos.lng(), google.maps.Animation.BOUNCE);
}
// d = 2*alt*atan(alpha/2)
var alt = 20;
var alpha = 30;

var FOV = 2 * alt * Math.atan(alpha/2);

var done = [];

function interpolate(points) {
  
  for(i = 0; i < points.length; i++) {
    var row = [];
    done.push(row);
    for(j = 0; j < points.length; j++) {
      if (i == j || j == i - 1) done[i].push(true);
      else done[i].push(false);
    }
  }
  var inters = [];
  for(i = 0; i < points.length; i+=2) {
    for(j = 1; j < points.length; j+=2) {
      if (j == i) continue;
      if (done[i][j]) {
        console.log("TURES");
        continue;
      }
      delta = google.maps.geometry.spherical.computeDistanceBetween(points[i].pos, points[j].pos);
      console.log(delta);
      if (delta == 0) continue;
      if (delta > FOV) {
        frac = delta/FOV;
        console.log('frac: ' + frac);
        done[i][j] = true;
        for (k = 1; k < frac; k++) {
          interPos = google.maps.geometry.spherical.interpolate(points[i].pos, points[j].pos, k/frac);
          if (!google.maps.geometry.poly.isLocationOnEdge(interPos, currentPoly)) {
            placeMarker(interPos, interPos.lat() + ', ' + interPos.lng());
          }
        }
      }
    }
  }
  return allMarkers;
}

function translate(home, points) {
  var angles = [];
  for(i = 0; i < points.length - 1; i++) {
    gamma = google.maps.geometry.spherical.computeHeading(home.getPosition(), points[i].pos);
    if (gamma < 0) theta = -90 - gamma;
    else theta = 90 - gamma; 
    console.log("gamma: " + gamma + " theta: " + theta);
    // angles.push(gamma);
    angles.push((180*theta)/Math.PI);
  }

  var translated = [];

  for(i = 0; i < points.length - 1; i++) {
    d = google.maps.geometry.spherical.computeDistanceBetween(home.getPosition(), points[i].pos);
    console.log("d: " + d + " x: " + d*Math.cos(angles[i]) + " y: " + d*Math.sin(angles[i]));
    translated.push(new point(d*Math.sin(angles[i]), d*Math.cos(angles[i]), points[i].pos));
    // console.log('trans: ' + translated[i].x + " " + translated[i].y);
  }

  for(i = 0; i < translated.length; i++) {
    console.log("translated " + translated[i].x);
  }

  return translated;
  // console.log(area(translated)
} 