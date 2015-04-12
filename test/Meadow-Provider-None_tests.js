/**
* Unit tests for the Meadow "None" Provider
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var libFable = require('fable');
var libFoxHound = require('foxhound');

var _AnimalSchema = (
{
	"title": "Animal",
	"description": "A creature that lives in a meadow.",
	"type": "object",
	"properties": {
		"IDAnimal": {
			"description": "The unique identifier for an animal",
			"type": "integer"
		},
		"Name": {
			"description": "The animal's name",
			"type": "string"
		},
		"Type": {
			"description": "The type of the animal",
			"type": "string"
		}
	},
	"required": ["IDAnimal", "Name", "CreatingIDUser"]
});
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
	'Meadow-Provider-None',
	function()
	{
		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable);
						Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
					}
				);
			}
		);
		suite
		(
			'Query Processing',
			function()
			{
				test
				(
					'Create a record in the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						testMeadow.doCreate(testMeadow.query.clone().addRecord({ID:10}),
							function(pError, pRecord, pQuery)
							{
								Expect(pQuery.parameters.result.executed).to.equal(true);
								fDone();
							}
						)
					}
				);
				test
				(
					'Read a record from the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						var tmpQuery = testMeadow.query.clone()
										.addFilter('IDAnimal', 1);
						Expect(tmpQuery.parameters.result.executed)
							.to.equal(false);
						testMeadow.doRead(tmpQuery,
							function(pError, pRecord, pQuery)
							{
								Expect(tmpQuery.parameters.result.executed).to.equal(true);
								fDone();
							}
						)
					}
				);
				test
				(
					'Read all records from the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						testMeadow.doReads(testMeadow.query,
							function(pError, pRecord, pQuery)
							{
								Expect(pQuery.parameters.result.executed).to.equal(true);
								fDone();
							}
						)
					}
				);
				test
				(
					'Update a record in the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						testMeadow.doUpdate(testMeadow.query,
							function(pError, pRecord, pQuery)
							{
								// Can't really test update with NONE
								Expect(pError).to.equal('No record submitted');
								fDone();
							}
						)
					}
				);
				test
				(
					'Delete a record in the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						testMeadow.doDelete(testMeadow.query,
							function(pError, pRecord, pQuery)
							{
								Expect(pQuery.parameters.result.executed).to.equal(true);
								fDone();
							}
						)
					}
				);
				test
				(
					'Count all records from the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest');
						testMeadow.doCount(testMeadow.query,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								Expect(pQuery.parameters.result.executed).to.equal(true);
								fDone();
							}
						)
					}
				);
			}
		);
	}
);