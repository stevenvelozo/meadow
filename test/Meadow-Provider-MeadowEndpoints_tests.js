/**
* Unit tests for the Meadow "MeadowEndpoints" Provider
*
* These tests expect a MeadowEndpoints database.....
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var libAsync = require('async');

var tmpFableSettings = 	(
{
	MeadowEndpoints:
		{
		},
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

suite
(
	'Meadow-Provider-MeadowEndpoints',
	function()
	{
		var _SpooledUp = false;

		var getAnimalInsert = function(pName, pType)
		{
			return "INSERT INTO `FableTest` (`IDAnimal`, `GUIDAnimal`, `CreateDate`, `CreatingIDUser`, `UpdateDate`, `UpdatingIDUser`, `Deleted`, `DeleteDate`, `DeletingIDUser`, `Name`, `Type`) VALUES (NULL, '00000000-0000-0000-0000-000000000000', NOW(), 1, NOW(), 1, 0, NULL, 0, '"+pName+"', '"+pType+"'); ";
		};

		var newMeadow = function()
		{
			return require('../source/Meadow.js')
				.new(libFable, 'FableTest')
				.setProvider('MeadowEndpoints')
				.setSchema(_AnimalSchema)
				.setJsonSchema(_AnimalJsonSchema)
				.setDefaultIdentifier('IDAnimal')
				.setDefault(_AnimalDefault)
		};

		setup
		(
			function(fDone)
			{
				fDone();
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The MeadowEndpoints class should initialize itself into a happy little object.',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('MeadowEndpoints');
						Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
					}
				);
			}
		);
	}
);
