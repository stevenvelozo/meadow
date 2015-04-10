/**
* Unit tests for Meadow
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var libFable = require('fable');

var _AnimalSchema = (
{
	"title": "Animal",
	"description": "A creature that lives in a meadow.",
	"type": "object",
	"properties": {
		"id": {
			"description": "The unique identifier for an animal",
			"type": "integer"
		},
		"type": {
			"description": "The type of the animal",
			"type": "string"
		},
		"name": {
			"description": "The animal's name",
			"type": "string"
		},
		"age": {
			"description": "How old the animal is in days",
			"type": "number",
			"minimum": 0,
			"exclusiveMinimum": true
		},
		"tags": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"minItems": 0,
			"uniqueItems": true
		}
	},
	"required": ["id", "name", "age"]
});

suite
(
	'Meadow',
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
						var testMeadow = require('../source/Meadow.js').new();
						Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
					}
				);
				test
				(
					'There should be some basic metadata on the class properties',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable);
						Expect(testMeadow).to.have.a.property('scope')
						.that.is.a('string'); // Scope is always a string
						Expect(testMeadow).to.have.a.property('schema')
						.that.is.a('object');
					}
				);
				test
				(
					'Initialize with values',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'Animal', _AnimalSchema);
						Expect(testMeadow.scope)
							.to.equal('Animal');
						Expect(testMeadow.schema.title)
							.to.equal('Animal');
					}
				);
				test
				(
					'Alternative initialization',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable)
							.setScope('Animal')
							.setSchema(_AnimalSchema);
						Expect(testMeadow.scope)
							.to.equal('Animal');
						var tmpValidationResults = testMeadow.validateObject({id:10, type:'bunny', name:'foofoo', age:3});
						Expect(tmpValidationResults.Valid)
							.to.equal(true);
					}
				);
				test
				(
					'Validate a proper animal',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'Animal', _AnimalSchema);
						var tmpValidationResults = testMeadow.validateObject({id:10, type:'bunny', name:'foofoo', age:3});
						Expect(tmpValidationResults.Valid)
							.to.equal(true);
					}
				);
				test
				(
					'Validate a messed up animal',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'Animal', _AnimalSchema);
						// Our zombie needs a name!
						var tmpValidationResults = testMeadow.validateObject({id:9, type:'zombie', age:3});
						libFable.log.info('Bad Unnamed Zombie Validation Results', tmpValidationResults);
						Expect(tmpValidationResults.Valid)
							.to.equal(false);
					}
				);
			}
		);
	}
);