MockMe
========
[![Build Status](https://travis-ci.org/Iragne/MockMe.png?branch=master)](https://travis-ci.org/Iragne/MockMe)

Create easay mock url for express or file baed on model


Install
=======
npm install mock-me

Create you Model
================
example in api/models.js


var User = module.exports.User = function (){
	return {
		user_id:getSequence("users"),
		user_login:"TestUser",
		user_valide:1,
		user_email:"test@test.com",
		Messages:getArray("Message",10)
	};
};

