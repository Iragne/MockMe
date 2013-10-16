MockMe
========
[![Build Status](https://travis-ci.org/Iragne/MockMe.png?branch=master)](https://travis-ci.org/Iragne/MockMe)

Create easay mock url for express or file baed on model


Install
=======
npm install mock-me

Run
===
node index.js -m ./api/models.js -a ./api/actions.js  -p 8080 

```
node index.js --help
Usage: index [options] [arguments]

Mock Me. the mock generator

 Arguments:
  arg                         Sample argument

 Options:
  -a, --actions=/path         Path for actions file
  -m, --models=/path          Path for models file
  -o, --out=/path             Path for output mock file
  -c, --out-model=/path       Path for output model files
  -p, --port= 8080            Server Mock port
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

Report bugs to <admin@jast-io.com>.
```


Create your Model
================
example in api/models.js

```
var User = module.exports.User = function (){
    return {
		user_id:getSequence("users"),
		user_login:"TestUser",
		user_valide:1,
		user_email:"test@test.com",
		Messages:getArray("Message",10)
	};
};
```


Create your Action
==================
```
modules:[
    	{
			name:"User",
			path:"/api/0.1/:key/",
			actions:[
				{
					name:"user",
					uri:"users/:mrlid",
					output:{
						User:"User"
					}
				},
			]
		},
	]
```


