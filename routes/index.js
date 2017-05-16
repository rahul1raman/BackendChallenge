var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

//define variables
var total = get = post = put = del = others =  0;
var t1 = t2 = t3 = t4 = t5 = 0;
var min_get = min_post = min_put = min_del = min_others = 0;


var requests = [];


//function for number of requests in last minute
function lastMin() {
	var count_get = count_post =count_put = count_del = count_others = 0;
	var time_get = time_post = time_put = time_del = time_others = 0;

    var now = new Date();//get cuurent date
    var aMinuteAgo = now - (1000 * 60);//get time a minute ago
    for (var i = requests.length - 1; i >= 0; i--) {
    	//every request recieved at time stamp greater than a minute ago 
    	//happened in last minute
        if (requests[i].hit_time >= aMinuteAgo) {
        	//console.log(requests[i].hit_time);
        	if(requests[i].type == 'GET'){
        		count_get++; //increment get count
        		time_get += requests[i].time; //add time taken
        	}else if(requests[i].type == 'POST'){
        		count_post++; //increment post count
        		time_post += requests[i].time; //add time taken
        	}else if(requests[i].type == 'PUT'){
        		count_put++; //increment put count
        		time_put += requests[i].time; // add time taken
        	}else if(requests[i].type == 'DELETE'){
        		count_del++; // del count
        		time_del += requests[i].time;
        	}else {
        		count_others++;
        		time_others += requests[i].time;
        	}
        } else {
            break;
        }
    }
    return  {
    	//return an obj with counts and time of requests
    	//in last minute
    	'count_get': count_get,
    	'count_post': count_post,
    	'count_put': count_put,
    	'count_del': count_del,
    	'count_others': count_others,
    	'time_get': time_get,
		'time_post': time_post,
		'time_put': time_put,
		'time_del': time_del,
		'time_others': time_others    	
    };
}


/*Endpoint 1*/
router.all('/process/*', function(req, res, next){

	var timeout = getRandom(15000, 30000); //generate random timeout of 15 to 30 sec
	//details of the request for lastMin() 
	var details = {'type': req.method, 
				   'hit_time': Date.now(),
					'time': timeout}


	requests.push(details); // add detail to requests 
	//console.log(requests);
	
	total+=1;   //increment total number of hits on process endpoint
	if(req.method == 'GET'){ //get count and timeout
		get += 1; 
		t1 += timeout;
		min_get = lastMin(); //calculate requests in last minute
	}else if(req.method == 'POST'){
		post +=1; //post counter
		t2 += timeout;
		min_post = lastMin();
	}else if(req.method == 'PUT'){
		put +=1; //put counter
		t3 += timeout;
		min_put = lastMin();
	}else if(req.method == 'DELETE'){
		del +=1; //delete counter
		t4 += timeout;
		min_del = lastMin();
	}else{
		others +=1; //counter for other requests
		t5 += timeout;
		min_others = lastMin();
	}

	setInterval(function() {
		//clear requests object after a minute
		requests.length = 0; 
		min_get = min_post = min_put = min_del = min_others = 0;
	}, 60000);

	setTimeout(function() {
		//send request after a random timeout
		res.json({ 'time': getTime(), //get formatted time
			'method': req.method, 
			'headers': req.headers,
			'path': req.path,
			'query': req.query,
			'body': req.body,
			'duration': timeout/1000 + 's' //duration in seconds

		});
	}, timeout);
});


/*Endpoint 2*/
router.get('/stats', function(req, res, next){
	
	re = {'Total Requests Since Server Startup': total,
	'Average Response Time' : 
	//in seconds
	{
		'get': t1/(get * 1000),
		'post': t2/ (post * 1000),
		'put': t3/ (put * 1000),
		'delete': t4 / (del * 1000),
		'others': t5/ (others * 1000)
	},
	'Requests per HTTP type': {
		'GETs': get,
		'POSTs': post,
		'PUTs' : put,
		'DELETEs': del,
		'OTHER REQUESTS' : others
	},
	'Requests in last minute': {
		'GETs': min_get.count_get,
		'POSTs': min_post.count_post,
		'PUTS': min_put.count_put,
		'DELETEs': min_del.count_del,
		'OTHERs': min_others.count_others
	},
	'Average Response Time (last min)':{
		'get': min_get.time_get/( min_get.count_get * 1000),
		'post': min_post.time_post/ ( min_post.count_post * 1000),
		'put': min_put.time_put/ ( min_put.count_put * 1000),
		'delete': min_del.time_del / ( min_del.count_del * 1000),
		'others': min_others.time_others/ ( min_others.count_others * 1000)
	}		
}
	res.json(re);
});



/*Select random no. in range, for timeout*/
function getRandom(min, max) {
	var t = Math.random() * (max - min) + min;
	return t;
}

/*Format timestamp in YYYY-MM-DD HH:MM:SS*/
function getTime(){
    var d = new Date();
    d = d.getFullYear() 
    	+ "-" 
    	+ ('0' + (d.getMonth() + 1)).slice(-2) 
    	+ "-" + ('0' + d.getDate()).slice(-2) + " " 
    	+ ('0' + d.getHours()).slice(-2) + ":" 
    	+ ('0' + d.getMinutes()).slice(-2) + ":" 
    	+ ('0' + d.getSeconds()).slice(-2);

    return d;
}


/*Endpoint to redirect invalid hits*/
router.all('/*', function(req, res) {
	res.redirect('/')
});


module.exports = router;
