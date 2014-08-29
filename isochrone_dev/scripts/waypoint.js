function waypoints(points, alt) {
  var navPoints = "float mission[0][" + points.length + "] = {\n";
  navPoints += "    {MAV_CMD_NAV_TAKEOFF,  0, 6, 0, 0},\n";
  for(i = 0; i < points.length; i++) {
    navPoints += "    {MAV_CMD_NAV_WAYPOINT, 0, 0, " + alt + ", " + points[i].pos.lat() + ", " + points[i].pos.lng() + "}\n";
    // if (i != points.length - 1) navPoints += ",\n";
  }
  navPoints += "    {MAV_CMD_RETURN_TO_LAUNCH, 0, 0, 0, 0}\n";
  navPoints += "};\n";
  return navPoints;
}

function printPoints() {
  $("#code").empty().append(waypoints(currentPath, 3.0));
}