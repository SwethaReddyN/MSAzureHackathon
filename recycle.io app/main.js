var map, infobox, numOfBins;
var binIdArr = [];
var binIdTypeMap = new Map();
var binLatArr = new Map();
var binLongArr = new Map();
var binLocationArr = new Map();
var binInfoArr = [];

const mapWidthPadding = 0.001;
const mapHeightPadding = 0.005;

// Load the map
	function loadMap() {
		var latArr = [];
		var longArr = [];
	google.charts.load('current', {'packages': ['corechart']});

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
			numOfBins = response.length;
			for (var i = 0; i < numOfBins; i++) {

				var lat = response[i].BinLat.trim();
				var lon = response[i].BinLon.trim();

				if (!lat.includes("undefined") && !lon.includes("undefined")) {
					var binId = response[i].BinId.trim().replace("bin", "");
					binIdArr.push(binId);
					binIdTypeMap.set(binId, response[i].BinType.trim());
					latArr.push(Number(lat));
					binLatArr.set(binId, Number(lat));
					longArr.push(Number(lon));
					binLongArr.set(binId, Number(lon));
					
				}
			}

       }
    };
	xhttp.open("GET", "https://smartwebmapapp.azurewebsites.net/api/webmapapp?status=start", false);
	xhttp.setRequestHeader("Content-Type", "text/html");
    xhttp.send(); 
	
	

	
	// Set the bounds of the map
	var box = new Microsoft.Maps.LocationRect.fromEdges(
		Math.max.apply(Math,latArr) + mapHeightPadding,
		Math.min.apply(Math,longArr) - mapWidthPadding,
		Math.min.apply(Math,latArr) - mapHeightPadding,
		Math.max.apply(Math,longArr) + mapWidthPadding
	);

	// Initialize the map
	map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
		bounds: box
	});
	
	// Create the infobox
	infobox = new Microsoft.Maps.Infobox(location, {
		visible: false
	});

	
	// Adding pushpin to the map
	for (i = 0; i < numOfBins; i++) {
		var location = new Microsoft.Maps.Location(latArr[i], longArr[i]);
		

		
		
		createScaledPushpin(i, location, 'trash_bin.png', 0.05, function(pin) {
			map.entities.push(pin);
		});
		

		
		//Microsoft.Maps.Events.addHandler(pin, 'mouseover', pushpinMouseover);
		//Microsoft.Maps.Events.addHandler(pin, 'mouseout', pushpinMouseout);
	}
	
}

function pushpinMouseover(e) {
	infobox.setOptions({
		visible: false
	});
	if (e.target.metadata) {
		var binId = e.target.metadata.title.substring(5,e.target.metadata.title.length);
		if (!binLocationArr.has(binId)) {
			Microsoft.Maps.loadModule('Microsoft.Maps.Search', function() {
				var searchManager = new Microsoft.Maps.Search.SearchManager(map);
				var reverseGeocodeRequestOptions = {
					location: new Microsoft.Maps.Location(binLatArr.get(binId), binLongArr.get(binId)),
					callback: function(answer, userData) {	
						binLocationArr.set(binId, answer.address.formattedAddress);
						createBriefInfobox(e, binId, binLocationArr.get(binId));
					}
				};
				
				searchManager.reverseGeocode(reverseGeocodeRequestOptions);
			});
			
		} else {
			createBriefInfobox(e, binId, binLocationArr.get(binId));
		}
	}
}

function createBriefInfobox(e, binId, binLocation) {
	infobox.setOptions({
			location: e.target.getLocation(),
			offset: new Microsoft.Maps.Point(-160, 35),
			htmlContent: createInfoboxBody(binId, binIdTypeMap.get(binId), binLocation),
			visible: true
	});
	infobox.setMap(map);
	/*
	infobox = new Microsoft.Maps.Infobox(location, {
			location: e.target.getLocation(),
			offset: new Microsoft.Maps.Point(-160, 35),
			htmlContent: createInfoboxBody(binId, binIdTypeMap.get(binId), binLocation),
			visible: true
	});
	infobox.setMap(map);
	*/
}

function pushpinMouseout(e) {
	infobox.setOptions({
		visible: false
	});

	infobox.setMap(null);


}

 function createScaledPushpin(i, location, imgUrl, scale, callback) {
        var img = new Image();
        img.onload = function () {
            var c = document.createElement('canvas');
            c.width = img.width * scale;
            c.height = img.height * scale;

            var context = c.getContext('2d');

            //Draw scaled image
            context.drawImage(img, 0, 0, c.width, c.height);

            var pin = new Microsoft.Maps.Pushpin(location, {
                //Generate a base64 image URL from the canvas.
                icon: c.toDataURL(),

                //Anchor based on the center of the image.
                anchor: new Microsoft.Maps.Point(c.width/2, c.height/2)
            });

			pin.metadata = {
				title: 'Bin #' + binIdArr[i],
				description: 'test'
			};
			Microsoft.Maps.Events.addHandler(pin, 'mouseover', pushpinMouseover);
			Microsoft.Maps.Events.addHandler(pin, 'mouseout', pushpinMouseout);
            if (callback) {
                callback(pin);
            }
        };

        img.src = imgUrl;
}




function getBinInfo(binId) {
	var binInfo = new Map();
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText );
			
			binInfo.set('binId', binId);
			var tempInfo = [];

			for (var j = 0; j < response.length; j++) {

				binInfo.set('binType', response[j].BinType);
				tempInfo.push(response[j].Types.trim());
				tempInfo.push(response[j].Count);
				

				
			}
			binInfo.set('violation', tempInfo);
			binInfo.set('location', '');
			binInfoArr.push(binInfo);
			//alert(this.responseText);
	   }
	};

	xhttp.open("GET", "https://smartwebmap.azurewebsites.net/api/webmap?binid=bin" + binId, false);
	xhttp.setRequestHeader("Content-Type", "text/html");
	xhttp.send(); 
}


function createDetailBox(binId) {
	$('#infobox_detail').css("display", "flex");
	var binInfo;
	var binExisted = false;
	for (var i = 0; i < binInfoArr.length; i++) {
		binInfo = binInfoArr[i];
		if (binInfo.get('binId') === binId) {
			$('#detailbox_header').text("Bin #" + binInfo.get('binId'));
			$('#infobox_body_type').text(binInfo.get('binType'));

			$('#infobox_body_location').text(binLocationArr.get(binId.toString()));
			drawDetailboxChart(binInfo.get('violation'));
			getUrl(binId);
			binExisted = true;
			break;
		}
		
	}
	
	if (!binExisted) {
		getBinInfo(binId);
		createDetailBox(binId);

	}
	
}

function drawDetailboxChart(violations) {
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Violation');
	data.addColumn('number', 'Count');
	for (var i = 0; i < violations.length; i = i + 2) {
		data.addRow([violations[i], violations[i + 1]]);
	}
	var options = {'width': $('.infobox_body').width(),
				   'height': 400,
				   'chartArea': {'left': '7%', 'width': '100%', 'height': '80%'}
				   };
				   
	
	var chart = new google.visualization.PieChart(document.getElementById('chart_violation'));
	chart.draw(data,options);
	$('.infobox_body').css("height", "400px");

}

function closeDetailBox() {
	$("#infobox_detail").css("display", "none");
	
}

function createInfoboxBody(binId, binType, binLocation) {
	var template = 
	'<div class="infobox_container">' +
		'<div class="infobox_header">Bin # {title}</div>' +
		'<div class="infobox_body">' + 
			'<div class="infobox_body_key">Location:</div>' +
			'<div class="infobox_body_value">{location}</div>' +
			'<div class="infobox_body_key">Type of Bin:</div>' +
			'<div class="infobox_body_value">{binType}</div>' +
			'<div class="infobox_btn"><button onclick="createDetailBox(' + binId + ')">More Detail</button><div>' +

		'</div>' +
	'</div>';
	
	template = template.replace('{title}', binId);
	template = template.replace('{binType}', binType);
	template = template.replace('{location}', binLocation);

	return template;
}


function openConfigBox() {
	$('#configbox').css('display', 'flex');
}

function closeConfigBox() {
	$('#configbox').css('display', 'none');	
}

function sendConfig() {
	var param = "";
	if ($('#cbcheckbox').is(':checked')) {
		param += "cardboard,";
		
	}
	
	if ($('#cflcheckbox').is(':checked')) {
		param += "cfl,";
		
	}
	
	if ($('#escheckbox').is(':checked')) {
		param += "egg_shell,";
		
	}
	
	if ($('#pbcheckbox').is(':checked')) {
		param += "plastic_bags,";
		
	}
	
	if ($('#sfcheckbox').is(':checked')) {
		param += "styrofoam,";
		
	}
	
	param = param.substring(0, param.length - 1);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			alert("Configuration Saved");
			$("#configbox").css("display", "none");

	   }
	};

	xhttp.open("GET", "https://smartconfiguration.azurewebsites.net/api/configuration?recyclable=" + param, false);
	xhttp.setRequestHeader("Content-Type", "text/html");
	xhttp.send(); 
	
	
}

function getUrl(binId) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = JSON.parse(this.responseText );
			var htmlUrl = "";
			for (var i = 0; i < response.length; i++) {
				htmlUrl += '<a href="' + response[i].URL + '" target="_blank">Violation Image ' + (i + 1) + '</a><br>';
				
			}
			$('#text_link').html(htmlUrl);
	   }
	};


	xhttp.open("GET", "https://smartwasteanalytics.azurewebsites.net/api/smartwasteanalytics?binid=bin" + binId, false);
	xhttp.setRequestHeader("Content-Type", "text/html");
	xhttp.send(); 
	
	
}