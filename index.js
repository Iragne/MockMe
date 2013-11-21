//
// Copyright (c) 2013 Jean Alexandre Iragne (https://github.com/Iragne)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var argp = require ("argp");
var map_action_express = {};
var render = require("./libs/render.js");
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var express = require('express');

var is_object = function(obj){
	"use strict";
    return obj === Object(obj);
};

var argv = argp.description ("Mock Me. the mock generator")
    .email ("admin@jast-io.com")
    .body ()
		.text (" Arguments:")
		.argument ("arg", { description: "Sample argument" })
        .text ("\n Options:")
        .option ({ short: "a", optional:false, type:"String", metavar: "/path", long: "actions",description: "Path for actions file" })
        .option ({ short: "m", optional:false, type:"String", metavar: "/path", long: "models",description: "Path for models file" })
        .option ({ short: "o", type:"String", metavar: "/path", long: "out",description: "Path for output mock file" })
        .option ({ short: "c", type:"String", metavar: "/path",long: "out-model", description: "Path for output model files" })
        .option ({ short: "p", type:"Number", metavar: " 8080",long: "port", description: "Server Mock port" })
        .help ()
        .version ("v0.0.1")
    .argv ();

//console.log (argv);


try{

	var models = require(argv.models);
	var actions = require(argv.actions);

	for (var i = 0; i < actions.modules.length; i++) {
		var module = actions.modules[i];
		for (var j = 0; j < module.actions.length; j++) {
			var action = module.actions[j];
			var uri = module.path + action.uri;
			var output = render.renderOutputModel(action.output,models,action.output,null);
			if (output){
				map_action_express[uri] = output;
				if(action.consistency === false){
					//console.log("Dynamyc",uri);
					map_action_express[uri] = {render:function (action,models,url_params){ 
						//console.log(action);
						return render.renderOutputModel(action.output,models,action.output,url_params);
					},param:action};
				}
			}else
				console.log("Error output not found for action",action);
		}
	}

	//console.log(map_action_express);

	// for each (actions)
	// create uri
	// set path in map
	// get Model resturl
	//

	if (argv.port){
		var app = express();
		app.use(express.compress());
		app.use(express.logger());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.static(__dirname + '/express/public'));
		app.set('view engine', 'jade');
		app.set('views', __dirname + '/express/views');
		
		var isFunction = function (functionToCheck) {
			var getType = {};
			return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
		}
		var ar = Object.keys(map_action_express);
		var renderExpress = function (app,data,file_map){
			app.get(file_map, function(req, res){
				if (isFunction(data))
					res.json(data(req.params));
				else
					res.json(data);
			});
		};
		for (var i = 0; i < ar.length; i++) {
			var file_map = ar[i];
			var data = map_action_express[file_map];
			(function (data){
				if (is_object(data) && data.render !== undefined){
					renderExpress(app,function (url_params){
						return data.render(data.param,models,url_params);
					},file_map);
				}else
					renderExpress(app,data,file_map);
			})(data);
		}
		var r_models = render.renderModelsHtml(models);
		
		app.get("/", function(req, res){
			res.render("index",{urls:map_action_express,models:r_models});
		});
		app.listen(parseInt(argv.port,10));
	}

	// if app
	// start EXPRESS
	// bind app
	// start listen

	if (argv.out){
		var create_file = function (dirto,data) {
			"use strict";
			dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");
			dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");dirto = dirto.replace(":","");
			dirto = path.normalize(dirto);
			if (dirto.substring(0,1) != "/")
				dirto = path.normalize(__dirname+"/"+dirto);
			var dir = path.dirname(dirto);
			//console.log(dir);
			mkdirp(dir, "0777", function (err) {
				if(err)
					console.log(err);
				fs.writeFile(dirto, data, function(err) {
					if (err)
						console.log(err);
				});
			});
		};
		var ar = Object.keys(map_action_express);
		for (var i = 0; i < ar.length; i++) {
			var file_map = ar[i];
			var data = map_action_express[file_map];
			if (data.param != data.render && data.param !== undefined)
				data = data.render(data.param,{});
			create_file(argv.out + "/" + file_map,JSON.stringify(data,null,"\t"));
		}
	}
//if out
// create file 
// async file
// create path
// create file
// write
// end async


}catch(e){
	console.log("Error: ","actions file not found",argv.actions,"models file not found",argv.models,e,e.stack);
}