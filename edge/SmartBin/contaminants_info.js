/***
 * module to set and get bin information and manipulate violation info
 */
 
'use strict';

var FileSystem = require("fs");
var configFilePath = './configuration/contaminants.json';

var jsonList = []

var ContaminantsInfo = {
	
	jsonList: jsonList,
	configFilePath: configFilePath,
	
	//get contaminant list for the bin type
	getContaminantsList: function(binType) {
		
		if(binType === "recycle") {
			return JSON.parse(FileSystem.readFileSync(configFilePath)).nonrecyclables;
		} else 
			return ["cfl", "styrofoam", "cardboard", "plastic bags"];
	},
	
	//set contaminants customization
	setContaminantsList: function(list) {
		
		jsonList.length = 0;
		FileSystem.truncate(configFilePath, 0, function() {});
		
		Array.prototype.forEach.call(list, item => {
			jsonList.push(item.toLowerCase().replace("_", " ").trim());
		});
		
		FileSystem.writeFile(configFilePath, JSON.stringify(
				{"nonrecyclables": jsonList}), 
				(err) => {
					
					if(err)
						console.log(err);
				}
		);
		console.log("new configuration");
	}
}

module.exports = ContaminantsInfo;

//ContaminantsInfo.setContaminantsList(["CFL", "Styrofoam", "Plastic Bags", "Egg Shell"]);
//ContaminantsInfo.getContaminantsList();
