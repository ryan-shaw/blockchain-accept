# blockchain-accept
A Node.js module to accept Bitcoin through the blockchain.info API.
- Lite and fast, uses express.
- Uses blockchain.info's 'ad hoc' sending, store to cold storage.
- Uses mongo to store transactions

## Get started
Install via npm:
```javascript
npm install blockchain-accept
```

```javascript
var blockchain = require('blockchain-accept');
var settings = {
	callbackUrl: 'YOUR APP HOST (DO NOT INCLUDE PATHS)', (REQUIRED)
	addr: 'YOUR RECEIVE ADDRESS', (REQUIRED)
	confirmations: 4 (default: 6)
}
blockchain = blockchain(settings, function(returnObj){
	// This callback is called when a transaction has been confirmed and returns object data given to the receive function.
});
```

Get receive address:
```javascript
var obj = {
	userid: 123
}
blockchain.receive(1, obj, function(err, addr){
	if(err) return console.log(err);
	// addr holds the address you should give the user to send bitcoins to
});
```
