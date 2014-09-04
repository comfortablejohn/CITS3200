// home marker
var home;
var setHome = false;

// array of all markers and polygons so all can be cleared at once
polys = [];
allMarkers = [];
allPaths = [];

currentPath = [];
// global map var
var map;
var homePoint;

function update_loc_list() {
  tbl = document.getElementById('loc_table');
  tbl.innerHTML = '';
  tbl_str = ''
  for (i = 0; i < allMarkers.length; i++) {

  } 
}

function initialize() {
  var myOptions = {
    center: new google.maps.LatLng(53.349783, -6.260101),
    zoom: 14,
    disableDoubleClickZoom: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  var markers = [];

  google.maps.event.addListener(map, 'click', function(e) {
    //console.log(e.latLng);
    title = e.latLng.lat() + ', ' + e.latLng.lng();
    var m = placeMarker(e.latLng, title);

    markers.push(m);
    allMarkers.push(m);

    google.maps.event.addListener(m, 'click', function(event) {
      // drawPoly(markers);
      // markers = [];
      if (setHome) {
        if (home) {
          var oldHome = home;
          oldHome.setTitle(oldHome.getPosition().lat() + ', ' + oldHome.getPosition().lng());
          allPaths.push(oldHome);
        }
        home = this;

        homePoint = latLngToPoint(this.getPosition(), true);
        this.setTitle('home');
        var index;
        for(i = 0; i < allMarkers.length; i++) {
          if (allMarkers[i] === home) {
            allMarkers.splice(i, 1);
            break;
          }
        }
        setHome = false;
      }
    });
  });
}

// d = 2*alt*atan(alpha/2)

var i = 0;

function drawPoly(markers) {
  var paths = [];
  for (var i = 0; i < markers.length; i++) {
    paths[i] = markers[i].getPosition();
  }
  var poly = new google.maps.Polygon({
    paths: paths,
    map: map,
    geodisc: true,
    zindex: i++
  });
  polys.push(poly);
  google.maps.event.addListener(poly, 'click', 
      function(event) {

  });
}
 
var currentPoly;

function polyLine(points) {
  var pl = new google.maps.Polyline({
    map: map,
    path: points
  });
  currentPoly = new google.maps.Polygon({paths: points, geodisc: true});
  allPaths.push(pl);
}

function placeMarker(position, title, ani) {
  if (ani) a = ani;
  else a = null;
  ORIGIN = position;
  // console.log('origin: ' );
  // console.log(ORIGIN);
  var marker = new google.maps.Marker({
    position: position,
    map: map,
    title: title,
    animation: a
  });
  return marker;
}

function clear() {
  // console.log(
  //   google.maps.geometry.spherical.computeDistanceBetween(
  //     allMarkers[0].getPosition(), allMarkers[1].getPosition()
  //   )
  // );

  for(i = 0; i < allMarkers.length; i++)
    allMarkers[i].setVisible(false);
  for (i = 0; i < polys.length; i++) {
    polys[i].setVisible(false);
  }
  for (i = 0; i < allPaths.length; i++)
    allPaths[i].setVisible(false);
  polys = [];
  allMarkers = [];
  allPaths = [];
}

// origin initialisers for conHull
origin = new point(10000000000, 10000000000, null);

function mysort(a, b) {
  return cross(origin, a, b);
}

/*
 * cross product from origin o between points a and b.
 * cross(o,a,b) is > 0 if a -> b is left turn, < 0 if a -> b is right turn
 * and = 0 is collinear.
 */
function cross(o, a, b) {
  // console.log("Origin: " + o.x + " " + o.y);
//  console.log((a.x - o.x) + "|||" + (b.y - o.y));
  c = (a.x - o.x)*(b.y - o.y) - (a.y - o.y)*(b.x - o.x);
  //console.log("C " + c);
  return c;
  // return (a.x - o.x)*(b.y - o.y) - (a.y - o.y)*(b.x - o.x);
}

/*
 * compute convex hull of set of x,y cartesian points
 */
function conHull(points, conhull) {

  if (points.length < 3) {
    alert("Please make sure you have at least 3 points");
    return;
  }

  var origini;
  for(i = 0; i < points.length; i++) {
    if (points[i].x < origin.x) {
      origin.x = points[i].x;
      origin.y = points[i].y;
      origin.pos = points[i].pos;
      origini = i;
    } else if (points[i].x == origin.x && points[i].y < origin.y) {
      origin.x = points[i].x;
      origin.y = points[i].y; 
      origin.pos = points[i].pos;
      origini = i;
    }
  }

  points.splice(origini, 1);

  points.sort(mysort);

//  m = new google.maps.Marker({
//    position: origin.pos,
//    map: map,
//    title: 'origin',
//    zIndex: 10000
//  });

  // console.log("Marker: " + m.getPosition().lat() + " " + m.getPosition().lng());

  stack = [];
  stack.push(origin);
  stack.push(points[0]);
  stack.push(points[1]);

  for (i = 2; i < points.length; i++) {
    while (conhull && cross(points[i], stack[stack.length - 2], stack[stack.length - 1]) > 0) {
      stack.pop();
    }
    stack.push(points[i]);
  }

  stack.push(origin);
  currentPath = stack;
  drawCon(stack);
  return stack;
}

function drawCon(points) {
  path = [];
  for(i = 0; i < points.length; i++) {
    path.push(points[i].pos);
  }
  polyLine(path);
  // poly = new google.maps.Polygon({
  //   paths: path,
  //   map: map
  // });
  // polys.push(poly);
 document.getElementById('area').innerHTML = area(points);
}

//function area(points) {
//  var sum = 0;
//  for(i = 1; i < points.length; i++) {
////    console.log("i: " + points[i].x + " " + points[i].y + " i - 1: " + points[i-1].x + " " + points[i-1].y);
//    sum += cross(origin, points[i], points[i - 1]);
//  }
//  return sum/2;
//}

// constants
pi = Math.PI;
R = 6378137 // Earth radius (m)

// console.log(pi);
// x = (R*pi*lat)/(180deg*sqrt(2))
// y = R*sqrt(2)sin(long)


function point(xx,yy, latLng) {
  this.x = xx;
  this.y = yy;
  this.pos = latLng;
}

/*
 * convert lat lng to cartesian 
 */
function latLngToPoint(latLng, h) {
  // lat = (latLng.lat()*Math.PI)/180;
  // lng = (latLng.lng()*Math.PI)/180;
  // // var x = (R*pi*lng)/(180*Math.sqrt(2));
  // // var y = (R*Math.sqrt(2)*Math.sin(lat));
  // var x = (R*Math.sin(lat)*Math.cos(lng));
  // var y = (R*Math.sin(lat)*Math.sin(lng));
  // return new point(x,y, latLng);
  p = map.getProjection().fromLatLngToPoint(latLng);
  // if (home && !h && false) {
  //   x = p.x - homePoint.x;
  //   y = p.y - homePoint.y;
  // } else {
  //   x = p.x; y = p.y;
  // }
    x = p.x; y = p.y;
  
  return new point(x, y, latLng);
}

/*
 * convert markers to x,y points and draw con hull
 */
function xandy(conhull) {
  points = [];
  for(i = 0; i < allMarkers.length; i++) {
    var p = latLngToPoint(allMarkers[i].getPosition());
    // console.log(i + " " + p.x + " " + p.y);
    points.push(p);
  }

  return conHull(points, conhull);
}

/**
 * from http://stackoverflow.com/questions/16873323/javascript-sleep-wait-before-continuing
 * @param  {[type]} milliseconds [description]
 * @return {[type]}              [description]
 */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/*****************************************************************************/
//
//    Here starts Isochrone things
//
/*****************************************************************************/
var ORIGIN = null;

function getOrigin() {
  if (ORIGIN != null) {
    console.log(ORIGIN);
    return ORIGIN;
  } else {
    console.log('ORIGIN has not been set');
  }
}

/**
 * returns time limit in seconds based on input in minutes
 * @return {[type]} [description]
 */
function getTimeLimit() {
  var val = parseInt(document.getElementById('timeLimit').value)*60;
  console.log('getting time limit: ' + val);
  return val;
}

/** 
 * Calculate walking distance based on inputs for walking speed, time restriction etc. 
 * @param number time Allowed walking time in seconds
 * @return number Radius of walking circle in meters
 */
function getWalkingRadius(time) {
  var t = time // allowable time constant (s) 
  if (time == null) {
    t = 15*60; // set to 15 minutes
  }

  // change this to get input from walking speed, and allowable travel time
  var v = 1.34; // (m/s) 

  return v*t; // (m) also radius of circle
}

// function getDistance(velocity, time) {

// }

/**
 * Draws circle based on estimated distance reachable in straight line
 * from origin with estimated walking speed. 
 * @return {[type]} [description]
 */
function drawWalkingIsochrone() {
  // change this to get input from walking speed, and allowable travel time
  var walkV = 1.34; // (m/s) 
  var tau = 15*60; // allowable time constant (s) (currently at 15 minutes)

  var walkDistance = walkV*tau; // (m) also radius of circle

  for (i = 0; i < allMarkers.length; i++) {
    var circOptions = {
      map: map,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      center: allMarkers[i].getPosition(),
      radius: walkDistance
    };
    c = new google.maps.Circle(circOptions);
  }
}

function handleDistMatrix(response, status) {
  console.log(response);
}

function makeGrid(area) {

  var rho = 1/5; // grid resolution/density (points/m^2)
  // assume grid is square
  var radius = Math.sqrt(area)/2.0;

  var centre = map.getCenter();
  var circOptions = {
    map: map,
    fillOpacity: 0.0,
    strokeOpacity: 0.0,
    center: centre,
    radius: radius
  };

  c = new google.maps.Circle(circOptions);
  console.log(c.getCenter());
  var bounds = c.getBounds();
  var latlng_SW = bounds.getSouthWest();
  var latlng_NE = bounds.getNorthEast();

  var lo_lat = latlng_SW.lat();
  var hi_lat = latlng_NE.lat();
  var lo_lng = latlng_SW.lng();
  var hi_lng = latlng_NE.lng();

  var lat_step = (hi_lat - lo_lat)*rho;
  var lng_step = (hi_lng - lo_lng)*rho;

  var gridMarkers = []
  var gridPoints = []

  for (var lat = lo_lat; lat <= hi_lat; lat += lat_step) {
    for (var lng = lo_lng; lng <= hi_lng; lng += lng_step) { 
      console.log (lat + ' ' + lng);
      l = new google.maps.LatLng(lat, lng);
      gridPoints.push(l);
      if (gridPoints.length >= 5) break;
      // var m = new google.maps.Marker({
      //   map: map,
      //   position: new google.maps.LatLng(lat, lng)
      // });
      // gridMarkers.push(m)
    }
    // if (gridPoints.length >= 100) break;
  }
  console.log(gridPoints.length)

  // get distance matrix from google maps api
  var serv = new google.maps.DistanceMatrixService();
  serv.getDistanceMatrix({
    origins: gridPoints,
    destinations: gridPoints,
    travelMode: google.maps.TravelMode.WALKING
  }, handleDistMatrix);
}

/**
 * Find nearest road from location ('origin'). 
 * 
 * Based on http://econym.org.uk/gmap/snap.htm
 * Works by requesting directions with origin and destination being the same
 * point, but requesting travel mode to be driving. The first (only?) start
 * location in the directions should then be the closest road. 
 * 
 * @param  LatLng origin Describes point from which to find closest road
 */
function findNearestRoad(origin) {
  // take this out eventually, just here for testing
  origin = allMarkers[0];

  service = new google.maps.DirectionsService();

  service.route({
    origin: origin.position,
    destination: origin.position,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  }, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      start_loc = result.routes[0].legs[0].start_location
      pos = new google.maps.LatLng(start_loc.k, start_loc.A);
      console.log(pos);
      placeMarker(pos, 't', true);
    } else {
      console.log('Directions Request died');
    }
  });

}

/**
 * More general version of nearest road, allows for trains, footpaths etc. 
 * 
 * Based on http://econym.org.uk/gmap/snap.htm
 * Works by requesting directions with origin and destination being the same
 * point, but requesting travel mode to be specific. The first (only?) start
 * location in the directions should then be the closest mode of specified
 * transport available. 
 * 
 * @param  LatLng origin Describes point from which to find closest road
 * @param  string place Defines mode of transport we're going for (e.g. "train_station")
 *           must conform to https://developers.google.com/places/documentation/supported_types
 *          
 */
function findNearestPlace(origin, place) {
  // take this out eventually, just here for testing
  var origin = allMarkers[0];
  var place = "train_station";
  var service = new google.maps.places.PlacesService(map); // not sure this is initializing properly
  var rankBy = google.maps.places.RankBy.DISTANCE; // want the closest one
  var radius = getWalkingRadius(15*60);
  console.log(radius);
  console.log(origin.position.toString());
  // broken
  service.nearbySearch({
    location: origin.position,
    types: [place],
    radius: radius
    // rankBy: rankBy
  }, function (result, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < result.length; i++) {
        closest = result[i].geometry.location;
        // pos = new google.maps.LatLng(start_loc.k, start_loc.A);
        console.log(closest);
        placeMarker(closest, 't', true);
      }
    } else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
      console.log('(findNearestPlace) Too many requests');
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
      console.log('(findNearestPlace) No place found within required distance');
    } else {
      console.log('(findNearestPlace) Directions Request died');
    }
  });
}

/**
 * Calculate ratio of distances between Euclidean distance of World Coordinates
 * and the distance based on spherical projection from LatLng points. 
 * 
 * @return {[type]} [description]
 */
function distRatioBetweenCoordinates() {
  p1 = allMarkers[0].position;
  p2 = allMarkers[1].position;

  c1 = map.getProjection().fromLatLngToPoint(p1);
  c2 = map.getProjection().fromLatLngToPoint(p2);

  // Google Maps spherical distance between LatLng Points based on Mercator projection
  dist_mercator = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
  // Euclidean distance of World Coordinates 
  dist_world = Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2));

  // The ratio of the two can be used to convert meters in global terms, to 
  // distance in World Coordinates
  return dist_mercator/dist_world;
}

/**
 * Project global distance (in meters) to distance in world coordinates (pixels(ish))
 * @param  {[type]} distance [description]
 * @return {[type]}          [description]
 */
function projectDistanceToWorldCoordinates(distance) {
  // ratio of distance in latlng coordinates with world coordinates (pixels)
  var DISTANCE_RATIO = 132622.60779375583;
  
  // Using this function may be safer (pretty sure it shouldn't change 
  // between browsers/things though..)
  // however might be pretty slow if called many times, so constant
  // above is used for now.
  // var DISTANCE_RATIO = distRatioBetweenCoordinates();
  
  return distance/DISTANCE_RATIO;
}

/**
 * Get array of points that lie on the boundary of a circle defined by
 * centre and radius (in meters)
 *
 * Map coordinate spaces described in https://developers.google.com/maps/documentation/javascript/maptypes
 * @param  {LatLng} centre Origin/Centre of the circle
 * @param  {number} radius Radius of the circle (in meters)
 * @return {Array.<LatLng>}        Array of LatLng points that lie on the circle
 *                                      boundary
 */
function getCircleBoundaryPoints(centre, radius) {
  console.log('centre: ');
  console.log(centre);
  console.log('radius: ' + radius);

  radius = projectDistanceToWorldCoordinates(radius);

  // centre = new google.maps.LatLng(allMarkers[0].position.lat(), allMarkers[0].position.lng());

  // TODO: change this to radius/DISTANCE_RATIO once general solution is implemented
  // radius = projectDistanceToWorldCoordinates(getWalkingRadius(60*60));

  // var resolution = 20;
  var resolution = 5;

  var thetaStep = Math.PI/resolution;

  var cc = map.getProjection().fromLatLngToPoint(centre);

  var boundaryPoints = [];

  for (var theta = 0; theta < Math.PI*2; theta += thetaStep) {
    var x = cc.x + radius*Math.cos(theta);
    var y = cc.y + radius*Math.sin(theta);
    // console.log('x: ' + x + ' y: ' + y);
    var pp = new google.maps.Point(x, y);
    var p = map.getProjection().fromPointToLatLng(pp);
    // place marker for debugging
    // placeMarker(p, theta.toString(), true);
    // console.log(p)
    boundaryPoints.push(p);
  }

  return boundaryPoints;
}


function sendRouteRequest(service, origin, destination, callback) {
  var success = false;

  service.route({
    origin: origin, 
    destination: destination,
    travelMode: travelMode
  }, function(results, status) {
    if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
      console.log(status);
      callback(null, false, status);
    }

    if (status == google.maps.DirectionsStatus.NOT_FOUND) {
      console.log('[directionsToMultiDestinations()] something was wrong with the origin or destination');
      callback(null, false, status);
    }

    if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
      console.log('[directionsToMultiDestinations()] route could not be found');
      callback(null, false, status);
    }

    if (status == google.maps.DirectionsStatus.OK) {
      console.log(results.routes[0].legs[0].duration)
      
      /* uncomment the following if you want to render the directions for
            debugging: */
      // dr = new google.maps.DirectionsRenderer({
      //   directions: results,
      //   map: map
      // });
      
      console.log('got directions back')
      success = true;
      callback(results.routes[0], success, status);
    } 
  });

}

// global routes list for directionsToMultiDestinations and things
var ROUTES = [];
var gotRoute = false;

function makeBoundaryFromRoutes(points) {
  // console.log(routes);
  poly = new google.maps.Polygon({
    paths: points, 
    map: map
  });
}

function walkRoutes(r) {
  // console.log('printing steps: ');
  console.log(r);
  steps = r.legs[0].steps;
  var i = 0;
  var totalTime = 0;
  var isochroneBoundary = [];
  var loop = function(s) {
    i++;

    totalTime += s[i].duration.value;

    if (totalTime >= timeLimit) {
      isochroneBoundary.push(s[i].end_location);
      placeMarker(s[i].end_location, 'boundary: ' + totalTime/60);
      return;
    }

    if (i < s.length) {
      loop(s);
    }
  } 

  loop(steps);
  // for (i = 0; i < routes.length; i++) {
    // console.log(routes[i].legs);
  // }
  makeBoundaryFromRoutes(isochroneBoundary);
}

/**
 * Returns array of routes from origin to all points in destinations array 
 * 
 * @param  {[type]} destinations [description]
 * @return {[type]}              [description]
 */
function directionsToMultiDestinations(origin, destinations, callback) {

  console.log('destinations length: ' + destinations.length)

  service = new google.maps.DirectionsService();
  travelMode = google.maps.DirectionsTravelMode.DRIVING;

  // try to get around sending all the requests at pretty much the same time
  // with custom recursive loop function
  var i = 0;
  var loop = function(list) {
    sendRouteRequest(service, origin, list[i], function(route, success, status) {
      i++;
      if (success) {
        ROUTES.push(route);
        walkRoutes(route);
      }  else if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
        console.log('got over query limit');
        console.log(status);

        // delay sending next request so that it gets through.
        var sleepTime = 5000; // ms
        sleep(sleepTime);

        i--;
      }

      if (i < list.length) {
        loop(list);
      }

    });
  }

  // start the loop
  loop(destinations);

  // callback(ROUTES[ROUTES.length - 1]);
  return;
}



var MAX_DRIVE_VEL = 30.5 // m/s

function drivingIsochrone(origin, time) {
  // origin = new google.maps.LatLng(allMarkers[0].position.lat(), allMarkers[0].position.lng());
  // origin = all
  ROUTES = []; // re-initialize routes list
  // time = 15*60;
  var radius = MAX_DRIVE_VEL*time;

  timeLimit = time;

  var boundaryPoints = getCircleBoundaryPoints(origin, radius);

  directionsToMultiDestinations(origin, boundaryPoints);

}

function walkingIsochrone() {

}
