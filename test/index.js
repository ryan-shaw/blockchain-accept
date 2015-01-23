var blockchain = require('../index');
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
mongoose.connect('mongodb://auth:94jefgadkgf29@niceway.to/auth');

var settings = {

};

describe('#receive', function(done){
	var obj = {test: 'test'};
	blockchain = blockchain(settings, function(obj1){
		obj1.should.have.deep.property('test', 'test');
	});
	it('should get input address', function(done){
		blockchain.receive(1, obj, function(err, addr){
			expect(err).to.equal(null);
			done();
		});
	});
});