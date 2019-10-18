
/*
<!--RELATED TO GOOGLE MAPS-->
<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script>
<script async defer src="https://maps.googleapis.com/maps/api/js?&callback=initMap">
</script>
*/
    
    function initMap() {

        var InforObj = [];
        // Create an array of alphabetical characters used to label the markers.
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var gmarkers = [];
        window.map = new google.maps.Map(document.getElementById('map'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true
        });
        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

             $.ajax({
                url: '@Url.Action("GetDeviceListLatLong", "Device", new { Area = "ClientAdmin", clientId = "" })',
                type: "GET",
                data: {},
                 success: function (data) {

                    var t = data;
                    console.log(t);
                   
                    if (t.length !== 0) {
                        $.each(t, function (marker, t) {

                            var icon = {
                                url: t.DevicePic, // url
                                scaledSize: new google.maps.Size(50, 50) // scaled size
                            }

                            var contentString = '<div id="content"><center><h3 style="color:#000;">' + t.Country +
                                '</h3><p>' + t.DeviceTypeName + '</p></center></div>';

                            if (t.Latitude !== null && t.Longitude !== null) {
                                marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(t.Latitude, t.Longitude),
                                    //icon: icon, //set image icon per device
                                    label: labels[t % labels.length],
                                    map: map
                                }); 
                            }

                            const infowindow = new google.maps.InfoWindow({
                                content: contentString,
                                maxWidth: 200
                            });

                            bounds.extend(marker.position);

                            google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                                return function () {
                                    closeOtherInfo();
                                    infowindow.open(map, marker);
                                    InforObj[0] = infowindow;
                                }
                            })(marker, t));
                            //adds the marker to spiderfier
                            oms.addMarker(marker);
                            map.fitBounds(bounds);
                            gmarkers.push(marker);
                            
                        });
                     }
                     var markerCluster = new MarkerClusterer(map, gmarkers,
                         {
                             imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                             //gridSize: 100,
                             zoomOnClick: true,
                             maxZoom: 10
                         });                  
                },
                error: function (error) { }
            }); 

        function closeOtherInfo() {
            if (InforObj.length > 0) {
                InforObj[0].set("marker", null);
                InforObj[0].close();
                InforObj.length = 0;
            }
        }

        var listener = google.maps.event.addListener(map, "idle", function () {
            map.setZoom(3);
            google.maps.event.removeListener(listener);
        });
    }
    //Refesh the map and get latest geolocations
    setInterval(function () { initMap(); }, 40000);
