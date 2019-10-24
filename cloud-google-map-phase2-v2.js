/*
<!--RELATED TO GOOGLE MAPS-->
<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script>
<script async defer src="https://maps.googleapis.com/maps/api/js?&callback=initMap">
</script>
*/

/*  Map refresh every 10 seconds
 *  Added fitbounds to fit map view according to available device origin
 *  Added overlapping markers for same location
 */
    
    
var map;
var markers = [];
var InforObj = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var markerCluster;

    function initMap() {

        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        var haightAshbury = { lat: 37.769, lng: -122.446 };

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: haightAshbury,
            mapTypeId: 'terrain'
        });

        var oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true
        });

        function reload() { 
             $.ajax({
                    url: '@Url.Action("GetAllDeviceByAccount", "Device", new { Area = "AccountAdmin" })',
                    type: "GET",
                    data: {},
                     success: function (data) {
                         console.log(data)

                         var t = data;
                         //heartbeat val here
                        var status = true;

                        

                        if (status == true) {
                            var blink = '<i class="fa fa-circle active Blink-mapStat"></i><span style="margin-left: 6px;">Active</span> <hr>';
                        } else {
                            var blink = '<i class="fa fa-circle inactive" style="color: #9E9E9E"></i><span style="color:#9E9E9E;margin-left: 6px;">Inactive</span><hr>';
                        }

                         $.each(t, function (marker, t) {

                             var defaultLink = "@Url.Action("GetConfiguration", "Configuration", new { Area = "AccountAdmin", clientId = Session["CurrentClientId"], accountId = "/", deviceId = "/", deviceTypeName = "/" })";
                             var deviceUrl = t.AccountId + "/" + t.DeviceId + "/" + t.DeviceTypeName;

                             var contentString = '<span><a id="configureBtn" onclick="test()" href=" ' + defaultLink + deviceUrl + '" data-toggle="tooltip" data-placement="top" title="Go to device configuration"><img class="device-img" src=" ' + t.DevicePic + ' "></a></span>' + blink +
                                 '<span>Country: </span>' + t.Country +
                                 '<br/><span>Device Type: </span>' + t.DeviceTypeName +
                                 '<br/><span>Device Name: </span>' + t.DeviceName;

                             var expectedPosition = new google.maps.LatLng(t.Latitude, t.Longitude);

                             var marker = new google.maps.Marker({
                                 position: expectedPosition,
                                 label: labels[t % labels.length],
                                 map: map
                             });

                             bounds.extend(marker.position);
                             map.fitBounds(bounds);
                             markers.push(marker);
                             oms.addMarker(marker);                     

                             const infowindow = new google.maps.InfoWindow({
                                 content: contentString,
                                 maxWidth: 200
                             });

                             google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                                 return function () {
                                     closeOtherInfo();
                                     infowindow.open(map, marker);
                                     InforObj[0] = infowindow;
                                 }
                             })(marker, t));                                               
                         });
                         markerCluster = new MarkerClusterer(map, markers,
                             {
                                 imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                                 //gridSize: 100,
                                 zoomOnClick: true,
                                 maxZoom: 10
                             }); 
                 
                    },
                    error: function (error) { }
                });
            }
         
            setInterval(function () {
                deleteMarkers();
                reload();
            }, 30000);
            reload();
    }

    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            markerCluster.removeMarker(markers[i]);
        }
    }

    function clearMarkers() {
        setMapOnAll(null);      
    }

    function showMarkers() {
        setMapOnAll(map);
    }

    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    function closeOtherInfo() {
        if (InforObj.length > 0) {
            InforObj[0].set("marker", null);
            InforObj[0].close();
            InforObj.length = 0;
        }
    }