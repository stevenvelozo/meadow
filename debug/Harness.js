
var libMeadow = require('../source/Meadow.js');

var tmpFableSettings = 	(
{
	LogStreams:
	[
	    {
	        level: 'trace',
	        streamtype:'process.stdout',
	    },
	    {
	        level: 'trace',
	        path: __dirname+'/../tests.log'
	    }
	]
});

var libFable = require('fable').new(tmpFableSettings);

var _BookSchema = require('../test/schemas/BookStore-MeadowSchema-Book.json');
	
var newMeadow = function()
{
	return require('../source/Meadow.js')
		.new(libFable, 'Book', _BookSchema)
		.setProvider('MeadowEndpoints');
};

var testMeadow = newMeadow();

testMeadow.fable.settings.QueryThresholdWarnTime = 1;

/* READ
var tmpQuery = testMeadow.setProvider('MeadowEndpoints').query.addFilter('IDBook', 1);
tmpQuery.addFilter('PublicationYear',2008);
testMeadow.doRead(tmpQuery,
    function(pError, pQuery, pRecord)
    {
		console.log(JSON.stringify(pRecord));
    }
)
*/

/* CREATE
var testMeadow = newMeadow();
var tmpQuery = testMeadow.query.clone().setLogLevel(5)
	.addRecord({Title:'Blastoise', Type:'Pokemon'});

testMeadow.doCreate(tmpQuery,
	function(pError, pQuery, pQueryRead, pRecord)
	{
		libFable.log.info('Record returned from Create:',pRecord);
	}
)
*/

///* UPDATE
var testMeadow = newMeadow();
var tmpQuery = testMeadow.query.clone().setLogLevel(5)
	.addRecord({IDBook:1, Type:'Novella'});

testMeadow.doUpdate(tmpQuery,
	function(pError, pQuery, pQueryRead, pRecord)
	{
		libFable.log.info('Record returned:',pRecord);
	}
)
//*/

///* DELETE
var testMeadow = newMeadow();
var tmpQuery = testMeadow.query.clone().setLogLevel(5)
	.addRecord({IDBook:10006, Type:'Novella'});

testMeadow.doDelete(tmpQuery,
	function(pError, pQuery, pQueryRead, pRecord)
	{
		libFable.log.info('Record returned:',pRecord);
	}
)
//*/
