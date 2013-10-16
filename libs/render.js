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


var is_array = function(a){
	"use strict";
    return Array.isArray(a);
};

var is_object = function(obj){
	"use strict";
    return obj === Object(obj);
};

var is_string = function(str){
	"use strict";
	return typeof str == 'string' || str instanceof String;
};

var is_number = function(n){
	"use strict";
	return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
};
var is_int = function(n) {
	"use strict";
	return parseInt(n,10) === n;
};

var is_float = function(n) {
	"use strict";
	return is_number(n) && ! is_int(n);
};

var renderOutputModel = module.exports.renderOutputModel = function (format,models,original){
	"use strict";
	var ret = {};
	var i = 0;
	try {
		if (format.type){
			if (is_array(format.type)){
				ret = [];
				for (i = 0; i < parseInt(format.number,10); i++) {
					ret.push(renderOutputModel(format.model,models,original));
				}
			}
		}else{
			if (is_object(format)){
				for (i = 0; i < Object.keys(format).length; i++) {
					var attr = Object.keys(format)[i];
					ret[attr] = renderOutputModel(format[attr],models,original);
				}
			}else{
				if (is_string(format)){
					if (models[format])
						return models[format]();
					else{
						console.log(original);
						throw "Error Model "+format;
					}
				}else{
					console.log(original);
					throw "Error Model "+format;
				}
			}
		}
	}catch (e){
		console.log(e,e.stack);
		return null;
	}

	return ret;
};

var is_model = function (obj,models){
	"use strict";
	for (var i = 0; i < Object.keys(models).length; i++) {
		var attr = Object.keys(models)[i];
		var found = true;
		if (Object.keys(obj).length != Object.keys(models[attr]()).length)
			found = false;
		for (var j = 0; found && j < Object.keys(models[attr]()).length; j++) {
			//console.log(obj);
			var at = Object.keys(models[attr]())[j];
			if (obj[at] === undefined){
				found = false;
				break;
			}
		}

		if(found)
			return attr;
	}
	//console.log("FOUND",obj);
	return false;
};

var rendermodel = function (model,models){
	"use strict";
	var ret = {};
	//console.log(model);
	for (var i = 0; i < Object.keys(model).length; i++) {
		var attr = Object.keys(model)[i];
		var val = model[attr];
		if (is_number(val)){
			if (is_int(val)){
				ret[attr] = "Int";
			}else{
				ret[attr] = "Float";
			}
		}else{
			if (is_string(val)){
				ret[attr] = "String";
			}else{
				if (is_array(val)){
					var m = "Undefined";
					if (val.length){
						m = is_model(val[0],models);
					}
					ret[attr] = "array<"+m+">";
				}else{
					//console.log(val);
					var my_model = is_model(val,models);
					if (is_object(val) && !my_model){
						ret[attr] = "Undefined model";//rendermodel(val, models);
					}else{
						ret[attr] = my_model;
					}
				}
			}
		}
	}
	return ret;
};

var renderModelsHtml = module.exports.renderModelsHtml = function(models){
	"use strict";
	var r_models = [];
	for (var i = 0; i < Object.keys(models).length; i++) {
		var attr = Object.keys(models)[i];
		if (attr.indexOf("incomplete") < 0){
			var r_m = {name:attr,def:rendermodel(models[attr](),models)};
			r_models.push(r_m);
		}
	}
	return r_models;
};


