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

var argp = require ('argp');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var express = require('express');
var url = require('url');
var is = require('is_');

var render = require('./libs/render.js');

var map_action_express = {};

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

if (argv.models === null) {
	console.log('Please specify model file');
	process.exit(1);
}
if (argv.actions === null) {
	console.log('Please specify actions file');
	process.exit(1);
}

function process_path(p) {
	if (p.match(/^\//)) {
		return p;
	}
	return './' + p;
}

console.log("Loading models from", argv.models);
console.log("Loading actions from", argv.actions);

var models = require(process_path(argv.models));
var actions = require(process_path(argv.actions));

for (var i = 0; i < actions.modules.length; i ++) {
	var module = actions.modules[i];
	for (var j = 0; j < module.actions.length; j ++) {
		(function() {
			var action = module.actions[j];
			var uri = module.path + action.uri;
			var output = render.renderOutputModel(action.output, models, action.output, null);
			if (output){
				map_action_express[uri] = {
					render: function() {
						return output;
					},
					method: action.method || 'GET',
				};
				if (action.post_params) {
					map_action_express[uri].post_params = action.post_params;
				}
				if (action.doc) {
					map_action_express[uri].doc = action.doc;
				}
				if (action.consistency === false) {
					map_action_express[uri].render = function (action,models,url_params) {
						return render.renderOutputModel(action.output, models, action.output, url_params);
					};
					map_action_express[uri].param = action;
				}
			}
			else {
				console.log("Error output not found for action",action);
			}
		})();
	}
}

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
			if(err) {
				console.log(err);
			}
			fs.writeFile(dirto, data, function(err) {
				if (err) {
					console.log(err);
				}
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
else {
	var port = 8080;
	if (argv.port) {
		port = parseInt(argv.port, 10);
	}

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
	};
	var ar = Object.keys(map_action_express);
	var renderExpress = function (app, data, output, file_map) {
		var m = data.method.toLowerCase();
		console.log("Add url :", m,file_map);
		app[m](file_map, function(req, res){
			var http_params = {method: 'GET'};
			if (req.method == 'POST') {
				http_params.method = 'POST',
				http_params.body_www_forms = req.body;
			}
			if (isFunction(output)) {
				res.json(output(req.params, http_params));
			}
			else {
				res.json(output);
			}
		});
	};
	for (var i = 0; i < ar.length; i++) {
		var file_map = ar[i];
		var data = map_action_express[file_map];
		(function (data){
			if (is.is_object(data) && data.render !== undefined) {
				renderExpress(app, data, function (url_params, http_params) {
					return data.render(data.param, models, {params: url_params, http_params: http_params});
				},file_map);
			}
			else {
				renderExpress(app, {method: 'GET'}, data, file_map);
			}
		})(data);
	}
	var r_models = render.renderModelsHtml(models);

	app.get("/", function(req, res){
		res.render("index", {
			urls: map_action_express,
			models: r_models
		});
	});

	app.get("/form", function(req, res){
		var parts = url.parse(req.url, true);
  	var query = parts.query;
		res.render("form", {path: query.path, params: query.params.split(',')});
	});

	app.listen(port);

	console.log('Mock me started at port', port)
}
