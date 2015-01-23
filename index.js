var express = require('express');
var app = express();
var extend = require('extend');
var mongoose = require('mongoose');
var https = require('https');
var util = require('util');
var uuid = require('node-uuid');

var tx = mongoose.model('blockchain-tx', {
	expected_btc: Number,
	return_data: Object,
	input_address: String,
	confirmed: Number,
	tx_id: String,
	notified: {type: Boolean, default: false}
});

var defaultSettings = {
	port: 8383,
	path: '/confirm',
	addr: '1EPpuUuuW9i2kPMHXLFmYUZZZs1ob9Q69S', // Required otherwise you are sending to me, you can override here >:D
	createUrl: 'https://blockchain.info/api/receive?method=create&address=%s&callback=%s',
	callback: '', // Required in settings
	confirmations: 6
};
var callback;
module.exports = function(settings, g_callback){
	if(typeof settings.callback === 'undefined'){
		return new Error('callback not set'); 
	}
	callback = g_callback;
	return {
		app: start(settings),
		receive: function(btc, objData, callback){
			var tx_id = uuid.v4();
			var url = util.format(defaultSettings.createUrl, defaultSettings.addr, defaultSettings.callback + ':' + defaultSettings.port + defaultSettings.path + '/' + tx_id);
			console.log(url);
			https.get(url, function(result){
				var data = '';
				result.on('data', function(chunk){
					data += chunk;
				});

				result.on('end', function(){
					console.log(data);
					try{
						var parsed = JSON.parse(data.toString());
						var newTx = new tx({expected_btc: btc, return_data: objData, input_address: parsed.input_address, confirmations: 0, tx_id: tx_id});
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
	};
};

function start(settings){
	defaultSettings = extend(defaultSettings, settings);
	app.get(defaultSettings.path + '/:tx_id', function(req, res){
		var tx_id = req.params.tx_id || '';

		var value = req.query.value/100000000 || 0;

		var input_address = req.query.input_address || '';

		var destination_address = req.query.destination_address || '';
		if(destination_address !== defaultSettings.addr) 
			return res.send('destination does not match');

		var confirmations = req.query.confirmations || 0;

		var return_data = {};

		tx.findOne({input_address: input_address, expected_btc: value, tx_id: tx_id}, function(err, tx){
			if(err || !tx) 
				return res.send('tx not found');

			tx.confirmed = confirmations;
			if(confirmations < defaultSettings.confirmations){
				console.log('[BCI-A] TX not enough confirmations yet: ' + tx.tx_id + ', confirmation count: ' + confirmations);
				res.send('not enough confirmations');
			}else{
				if(!tx.notified){
					callback(tx);
					tx.notified = true;
				}
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