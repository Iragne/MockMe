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



var seq_map = {};

var getSequence = function  (model,type,max) {
	if(!seq_map[model]) {
		seq_map[model] = 1;
	}
	if (max === undefined) {
		max = 300000;
	}
	if (type === undefined) {
		return seq_map[model]++ % max;
	}
	return "D"+(seq_map[model]++)+"A";
};

var now = function  (model) {
	return new Date().getTime();
};

var map_array = {};

var getSequenceCircular = function (a_array,key){
	var array = JSON.stringify(a_array);
	if (key) {
		array = key;
	}
	if (map_array[array] === undefined) {
		map_array[array] = 0;
	}

	var ret =  a_array[map_array[array]];
	map_array[array] = map_array[array] + 1;
	map_array[array] = (map_array[array]) % a_array.length;

	//console.log(map_array[array],array);
	return ret;
};

var getArray = function (model, number) {
	"use strict";
	var ret = [];
	for (var i = 0; i < number; i++) {
		ret.push(module.exports[model]());
	}
	return ret;
};


var Message = module.exports.Message = function (options){
	return {
		message_id: options && options.params ? parseInt(options.params.id,10) : getSequence("messages"),
		message_text: getSequenceCircular(["hello","fine","and you","me too"]),
	};
};



var User = module.exports.User = function (options){
	return {
		user_id:getSequence("users"),
		user_login:"TestUser",
		user_valide:1,
		user_email:"test@test.com",
		Messages:getArray("Message",10)
	};
};
