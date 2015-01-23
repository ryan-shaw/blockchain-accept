var express = require('express');
var app = express();
var extend = require('extend');
var mongoose = require('mongoose');
var https = require('https');
var util = require('util');

var tx = mongoose.model('blockchain-tx', {
	expected_btc: Number,
	return_data: Object,
	input_address: String,
	confirmed: Number
})

var defaultSettings = {
	port: 8383,
	path: '/confirm',
	addr: '12X2Yxm55LW3BrtrhUPWH7qvyE8k32M3VD',
	createUrl: 'https://blockchain.info/api/receive?method=create&address=%s&callback=%s',
	callback: 'http://home.min.vc'
};
var callback;
module.exports = function(settings, g_callback){
	callback = g_callback;
	return {
		app: start(settings),
		receive: function(btc, objData, callback){
			var url = util.format(defaultSettings.createUrl, defaultSettings.addr, defaultSettings.callback + ':' + defaultSettings.port + defaultSettings.path)
			https.get(url, function(result){
				var data = '';
				result.on('data', function(chunk){
					data += chunk;
				});

				result.on('end', function(){
					console.log(data);
					try{
						var parsed = JSON.parse(data.toString());
						var newTx = new tx({expected_btc: btc, return_data: objData, input_address: parsed.input_address, confirmations: 0});
						newTx.save(function(err){
							if(err) callback(err, null);
							callback(null, parsed.input_address);
						});
					}catch(e){
						callback(data.toString(), null);
					}
				});
			});
		}
	}
}

function start(settings){
	defaultSettings = extend(defaultSettings, settings);
	app.get(defaultSettings.path, function(req, res){
		console.log(req.query);
		var value = req.query.value || 0;
		var input_address = req.query.input_address || '';
		var destination_address = req.query.destination_address || '';
		if(destination_address !== defaultSettings.addr) 
			return res.send('destination does not match');
		var confirmations = req.query.confirmations || 0;
		var return_data = {};
		tx.findOne({input_address: input_address, expected_btc: value}, function(err, tx){
			if(err || !tx) 
				return res.send('err');
			tx.confirmed = confirmations;
			if(confirmations < 6){
				res.send('not enough confirmations');
			}else{
				callback(tx.return_data);
				res.send('*ok*');
			}
			tx.save();
		});
	});
	app.listen(defaultSettings.port, function(){
		console.log('Listening on ', defaultSettings.port);
	});
	return app;
}