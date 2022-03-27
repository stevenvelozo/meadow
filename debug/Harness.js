
var libMeadow = require('../source/Meadow.js');

var tmpFableSettings = 	(
{
	LogStreams:
	[
	    {
	        level: 'fatal',
	        streamtype:'process.stdout',
	    },
	    {
	        level: 'trace',
	        path: __dirname+'/../tests.log'
	    }
	]
});

var libFable = require('fable').new(tmpFableSettings);

var _AnimalJsonSchema = (
{
	title: "Animal",
	description: "A creature that lives in a meadow.",
	type: "object",
	properties: {
		IDAnimal: {
			description: "The unique identifier for an animal",
			type: "integer"
		},
		Name: {
			description: "The animal's name",
			type: "string"
		},
		Type: {
			description: "The type of the animal",
			type: "string"
		}
	},
	required: ["IDAnimal", "Name", "CreatingIDUser"]
});

var _AnimalSchema = (
[
	{ Column: "IDAnimal",        Type:"AutoIdentity" },
	{ Column: "GUIDAnimal",      Type:"AutoGUID" },
	{ Column: "CreateDate",      Type:"CreateDate" },
	{ Column: "CreatingIDUser",  Type:"CreateIDUser" },
	{ Column: "UpdateDate",        Type:"UpdateDate" },
	{ Column: "UpdatingIDUser", Type:"UpdateIDUser" },
	{ Column: "Deleted",         Type:"Deleted" },
	{ Column: "DeletingIDUser",  Type:"DeleteIDUser" },
	{ Column: "DeleteDate",      Type:"DeleteDate" }
]);

var _AnimalDefault = (
	{
		IDAnimal: null,
		GUIDAnimal: '',
	
		CreateDate: false,
		CreatingIDUser: 0,
		UpdateDate: false,
		UpdatingIDUser: 0,
		Deleted: 0,
		DeleteDate: false,
		DeletingIDUser: 0,
	
		Name: 'Unknown',
		Type: 'Unclassified'
	});
	
var newMeadow = function()
{
	return require('../source/Meadow.js')
		.new(libFable, 'Book')
		.setProvider('MeadowEndpoints')
		.setSchema(_AnimalSchema)
		.setJsonSchema(_AnimalJsonSchema)
		.setDefaultIdentifier('IDBook')
		.setDefault(_AnimalDefault)
};

var testMeadow = newMeadow();

testMeadow.fable.settings.QueryThresholdWarnTime = 1;

var tmpQuery = testMeadow.setProvider('MeadowEndpoints').query.addFilter('IDBook', 1);


testMeadow.doRead(tmpQuery,
    function(pError, pQuery, pRecord)
    {
        testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

    }
)



