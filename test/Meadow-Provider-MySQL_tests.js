/**
* Unit tests for the Meadow "MySQL" Provider
*
* These tests expect a MySQL database.....
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var libMySQL = require('mysql2');
var libAsync = require('async');

var tmpFableSettings = 	(
{
	MySQL:
		{
			Server: "192.168.59.103",
			Port: 3306,
			User: "admin",
			Password: "zKVMD14cPC5N",
			Database: "FableTest",
			ConnectionPoolLimit: 20
		}
});

var libFable = require('fable').new(tmpFableSettings);


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
	'Meadow-Provider-MySQL',
	function()
	{
		var _SpooledUp = false;

		var getAnimalInsert = function(pName, pType)
		{
			return "INSERT INTO `FableTest` (`IDAnimal`, `GUIDAnimal`, `CreateDate`, `CreatingIDUser`, `UpdateDate`, `UpdatingIDUser`, `Deleted`, `DeleteDate`, `DeletingIDUser`, `Name`, `Type`) VALUES (NULL, '00000000-0000-0000-0000-000000000000', NOW(), 1, NOW(), 1, 0, NULL, 0, '"+pName+"', '"+pType+"'); ";
		};

		setup
		(
			function(fDone)
			{
				// Only do this for the first test.
				if (!_SpooledUp)
				{
					var _SQLConnectionPool = libMySQL.createPool
					(
						{
							connectionLimit: tmpFableSettings.MySQL.ConnectionPoolLimit,
							host: tmpFableSettings.MySQL.Server,
							port: tmpFableSettings.MySQL.Port,
							user: tmpFableSettings.MySQL.User,
							password: tmpFableSettings.MySQL.Password,
							database: tmpFableSettings.MySQL.Database
						}
					);

					// Tear down previous test data
					libAsync.waterfall(
					[
						function(fCallBack)
						{
							_SQLConnectionPool.query('DROP TABLE IF EXISTS FableTest',
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query("CREATE TABLE IF NOT EXISTS FableTest (IDAnimal INT UNSIGNED NOT NULL AUTO_INCREMENT, GUIDAnimal CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000', CreateDate DATETIME, CreatingIDUser INT NOT NULL DEFAULT '0', UpdateDate DATETIME, UpdatingIDUser INT NOT NULL DEFAULT '0', Deleted TINYINT NOT NULL DEFAULT '0', DeleteDate DATETIME, DeletingIDUser INT NOT NULL DEFAULT '0', Name CHAR(128) NOT NULL DEFAULT '', Type CHAR(128) NOT NULL DEFAULT '', PRIMARY KEY (IDAnimal) );",
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query(getAnimalInsert('Foo Foo', 'Bunny'),
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query(getAnimalInsert('Red Riding Hood', 'Girl'),
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query(getAnimalInsert('Red', 'Dog'),
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query(getAnimalInsert('Spot', 'Dog'),
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						},
						function(fCallBack)
						{
							_SQLConnectionPool.query(getAnimalInsert('Gertrude', 'Frog'),
							function(pErrorUpdate, pResponse) { fCallBack(null); });
						}
					],
						function(pError, pResult)
						{
							// Now continue the tests.
							_SpooledUp = true;
							fDone();
						}
					);
				}
				else
				{
					fDone();
				}
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The MySQL class should initialize itself into a happy little object.',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('MySQL');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone()
							.addRecord({Name:'Blastoise', Type:'Pokemon'});

						testMeadow.doCreate(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// We should have a record ....
								Expect(pRecord.Name)
									.to.equal('Blastoise');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone()
							.addFilter('IDAnimal', 1);
						testMeadow.doRead(tmpQuery,
							function(pError, pRecord, pQuery)
							{
								// We should have a record ....
								Expect(pRecord.IDAnimal)
									.to.equal(1);
								Expect(pRecord.Name)
									.to.equal('Foo Foo');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						testMeadow.doReads(testMeadow.query,
							function(pError, pRecords, pQuery)
							{
								// We should have a record ....
								Expect(pRecords[0].IDAnimal)
									.to.equal(1);
								Expect(pRecords[0].Name)
									.to.equal('Foo Foo');
								Expect(pRecords[1].IDAnimal)
									.to.equal(2);
								Expect(pRecords[1].Name)
									.to.equal('Red Riding Hood');
								Expect(pRecords[1].Type)
									.to.equal('Girl');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone()
							.addRecord({IDAnimal:2, Type:'Human'});
						
						testMeadow.doUpdate(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// We should have a record ....
								Expect(pRecord.Type)
									.to.equal('Human');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone().addFilter('IDAnimal',3);
						
						testMeadow.doDelete(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// It returns the number of rows deleted
								Expect(pRecord)
									.to.equal(1);
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						Expect(testMeadow.query.parameters.result.executed)
							.to.equal(false);
						testMeadow.doCount(testMeadow.query,
							function(pError, pRecord, pQuery)
							{
								// There should be 5 records
								Expect(pRecord)
									.to.equal(5);
								Expect(pQuery.parameters.result.executed)
									.to.equal(true);
								fDone();
							}
						)
					}
				);
			}
		);
		suite
		(
			'Logged Query Processing',
			function()
			{
				test
				(
					'Create a record in the database',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone().setLogLevel(5)
							.addRecord({Name:'MewTwo', Type:'Pokemon'});

						testMeadow.doCreate(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// We should have a record ....
								Expect(pRecord.Name)
									.to.equal('MewTwo');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone().setLogLevel(5)
							.addFilter('IDAnimal', 1);
						testMeadow.doRead(tmpQuery,
							function(pError, pRecord, pQuery)
							{
								// We should have a record ....
								Expect(pRecord.IDAnimal)
									.to.equal(1);
								Expect(pRecord.Name)
									.to.equal('Foo Foo');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						testMeadow.doReads(testMeadow.query.setLogLevel(5),
							function(pError, pRecords, pQuery)
							{
								// We should have a record ....
								Expect(pRecords[0].IDAnimal)
									.to.equal(1);
								Expect(pRecords[0].Name)
									.to.equal('Foo Foo');
								Expect(pRecords[1].IDAnimal)
									.to.equal(2);
								Expect(pRecords[1].Name)
									.to.equal('Red Riding Hood');
								Expect(pRecords[1].Type)
									.to.equal('Human');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone().setLogLevel(5)
								.addRecord({IDAnimal:2, Type:'HumanGirl'});
						
						testMeadow.doUpdate(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// We should have a record ....
								Expect(pRecord.Type)
									.to.equal('HumanGirl');
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						var tmpQuery = testMeadow.query.clone().setLogLevel(5)
								.addFilter('IDAnimal',4);
						
						testMeadow.doDelete(tmpQuery,
							function(pError, pRecord, pQuery, pQueryRead)
							{
								// It returns the number of rows deleted
								Expect(pRecord)
									.to.equal(1);
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
						var testMeadow = require('../source/Meadow.js').new(libFable, 'FableTest')
							.setProvider('MySQL')
							.setSchema(_AnimalSchema)
							.setDefault(_AnimalDefault);

						Expect(testMeadow.query.parameters.result.executed)
							.to.equal(false);
						testMeadow.doCount(testMeadow.query.setLogLevel(5),
							function(pError, pRecord, pQuery)
							{
								// There should be 5 records
								Expect(pRecord)
									.to.equal(5);
								Expect(pQuery.parameters.result.executed)
									.to.equal(true);
								fDone();
							}
						)
					}
				);
			}
		);
	}
);