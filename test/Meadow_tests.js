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

var _TestAnimalJsonSchema = (
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
		let _Fable;
		setup
		(
			function()
			{
				_Fable = libFable.new(
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
						var testMeadow = require('../source/Meadow.js').new(_Fable);
						Expect(testMeadow).to.have.a.property('scope')
						.that.is.a('string'); // Scope is always a string
						Expect(testMeadow).to.have.a.property('defaultIdentifier')
						.that.is.a('string');
						Expect(testMeadow).to.have.a.property('schema')
						.that.is.a('object');
					}
				);
				test
				(
					'Initialize with values',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						Expect(testMeadow.scope)
							.to.equal('Animal');
						Expect(testMeadow.jsonSchema.title)
							.to.equal('Animal');
					}
				);
				test
				(
					'Try out some role names',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						Expect(testMeadow.getRoleName(0))
							.to.equal('Unauthenticated');
						Expect(testMeadow.getRoleName(100))
							.to.equal('Unauthenticated');
						Expect(testMeadow.getRoleName(-100))
							.to.equal('Unauthenticated');
						Expect(testMeadow.getRoleName(1))
							.to.equal('User');
					}
				);
				test
				(
					'Alternative initialization',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable)
							.setScope('Animal')
							.setSchema(_TestAnimalJsonSchema);
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
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
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
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						// Our zombie needs a name!
						var tmpValidationResults = testMeadow.validateObject({id:9, type:'zombie', age:3});
						_Fable.log.info('Bad Unnamed Zombie Validation Results', tmpValidationResults);
						Expect(tmpValidationResults.Valid)
							.to.equal(false);
					}
				);
				test
				(
					'Change provider',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						Expect(testMeadow.providerName)
							.to.equal('None');
					}
				);
				test
				(
					'Test log slow query method',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						testMeadow.logSlowQuery(100, testMeadow.query);
					}
				);
				test
				(
					'Try to change to a bad provider',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable, 'Animal', _TestAnimalJsonSchema);
						Expect(testMeadow.providerName)
							.to.equal('None');
						testMeadow.setProvider();
						Expect(testMeadow.providerName)
							.to.equal('None');
						testMeadow.setProvider('BADPROVIDERNAME');
						Expect(testMeadow.providerName)
							.to.equal('None');
					}
				);
				test
				(
					'Try to load from a json package',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable).loadFromPackage(__dirname+'/Animal.json');
						Expect(testMeadow.scope)
							.to.equal('FableTest');
					}
				);
				test
				(
					'Try to load from an empty json package',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable).loadFromPackage(__dirname+'/EmptyPackage.json');
						Expect(testMeadow.scope)
							.to.equal('Unknown');
					}
				);
				test
				(
					'Try to load from a bad json package',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(_Fable).loadFromPackage(__dirname+'/BadAnimal.json');
						Expect(testMeadow)
							.to.equal(false);
					}
				);

				test
				(
					'Able to override role names',
					function()
					{
						// given
						_Fable = libFable.new(
						{
							MeadowRoleNames: ['Cool', 'Bold', 'Tired'],
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

						const meadow = require('../source/Meadow.js').new(_Fable);

						// when
						const roleNames = [0, 1, 2].map(i => meadow.getRoleName(i));

						// then
						Expect(roleNames).to.deep.equal(_Fable.settings.MeadowRoleNames);
					}
				);
			}
		);
	}
);
