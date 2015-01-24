var blockchain = require('../index');
var should = require('chai').should();
var expect = require('chai').expect;
var assert = require('chai').assert;

var mongoose = require('mongoose');
mongoose.connect('mongodb://auth:94jefgadkgf29@niceway.to/auth');

var settings = {

};

blockchain = blockchain(settings, function(obj1){
	obj1.should.have.deep.property('test', 'test');
});

describe('#receive', function(done){
	var obj = {test: 'test'};
	
	it('should get input address', function(done){
		blockchain.receive(1, obj, function(err, addr){
			expect(err).to.equal(null);
			done();
		});
	});
});

describe('#convert', function(done){
	it('should return btc price', function(done){
		blockchain.convert('GBP', 10, function(err, value){
			assert.isNumber(value, 'value in btc');
			done();
		});
	})
});