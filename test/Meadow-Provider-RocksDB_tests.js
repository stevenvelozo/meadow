/**
* Unit tests for the Meadow "RocksDB" Provider
*
* These tests use a local RocksDB database on disk.
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

var libFS = require('fs');
var libPath = require('path');

var libMeadowConnectionRocksDB = require('meadow-connection-rocksdb');

var _RocksDBFolder = libPath.join(__dirname, '..', 'dist', 'FableTest-RocksDB');

var tmpFableSettings = (
{
	RocksDB:
	{
		RocksDBFolder: _RocksDBFolder
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

var libFable = new (require('fable'))(tmpFableSettings);

// Register the RocksDB connection service
libFable.serviceManager.addServiceType('MeadowRocksDBProvider', libMeadowConnectionRocksDB);
libFable.serviceManager.instantiateServiceProvider('MeadowRocksDBProvider');


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
	{ Column: "DeleteDate",      Type:"DeleteDate" },
	{ Column: "Metadata",        Type:"JSON" },
	{ Column: "ExtraData",       Type:"JSONProxy", StorageColumn:"ExtraDataJSON" }
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
	Type: 'Unclassified',

	Metadata: {},
	ExtraData: {}
});

suite
(
	'Meadow-Provider-RocksDB',
	function()
	{
		var _SpooledUp = false;

		var newMeadow = function()
		{
			return require('../source/Meadow.js')
				.new(libFable, 'FableTest')
				.setProvider('RocksDB')
				.setSchema(_AnimalSchema)
				.setJsonSchema(_AnimalJsonSchema)
				.setDefaultIdentifier('IDAnimal')
				.setDefault(_AnimalDefault);
		};

		suiteSetup
		(
			function(fDone)
			{
				if (!_SpooledUp)
				{
					// Remove any previous test database
					if (libFS.existsSync(_RocksDBFolder))
					{
						libFS.rmSync(_RocksDBFolder, { recursive: true, force: true });
					}

					// Ensure the dist directory exists
					var tmpDistDir = libPath.join(__dirname, '..', 'dist');
					if (!libFS.existsSync(tmpDistDir))
					{
						libFS.mkdirSync(tmpDistDir, { recursive: true });
					}

					// Connect to RocksDB
					libFable.MeadowRocksDBProvider.connectAsync(
						function(pError)
						{
							if (pError)
							{
								return fDone(pError);
							}

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

		suiteTeardown(function(fDone)
		{
			libFable.MeadowRocksDBProvider.closeAsync(function()
			{
				fDone();
			});
		});

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The RocksDB class should initialize itself into a happy little object.',
					function()
					{
						var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('RocksDB');
						Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
						Expect(testMeadow.providerName).to.equal('RocksDB');
					}
				);
			}
		);

		suite
		(
			'Create Operations',
			function()
			{
				test
				(
					'Create a record in the database',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(90210);

						var tmpQuery = testMeadow.query.clone().setLogLevel(5)
							.addRecord({Name:'Foo Foo', Type:'Bunny'});

						testMeadow.doCreate(tmpQuery,
							function(pError, pQuery, pQueryRead, pRecord)
							{
								Expect(pRecord.Name)
									.to.equal('Foo Foo');
								Expect(pRecord.Type)
									.to.equal('Bunny');
								Expect(pRecord.IDAnimal)
									.to.equal(1);
								Expect(pRecord.CreatingIDUser)
									.to.equal(90210);
								Expect(pRecord.GUIDAnimal)
									.to.be.a('string');
								Expect(pRecord.GUIDAnimal.length)
									.to.be.greaterThan(5);
								fDone();
							}
						);
					}
				);

				test
					(
						'Create a record with JSON data',
						function(fDone)
						{
							var testMeadow = newMeadow().setIDUser(90210);

							var tmpQuery = testMeadow.query.clone().setLogLevel(5)
								.addRecord({Name:'Moose', Type:'Mammal', Metadata: { habitat: 'forest', weight: 500 }, ExtraData: { endangered: false, population: 'stable' }});

							testMeadow.doCreate(tmpQuery,
								function(pError, pQuery, pQueryRead, pRecord)
								{
									// We should have a record with JSON data ....
									Expect(pRecord.Name)
										.to.equal('Moose');
									Expect(pRecord.Metadata)
										.to.be.an('object');
									Expect(pRecord.Metadata.habitat)
										.to.equal('forest');
									Expect(pRecord.ExtraData)
										.to.be.an('object');
									Expect(pRecord.ExtraData.endangered)
										.to.equal(false);
									fDone();
								}
							)
						}
					);
				test
				(
					'Create more records for later tests',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(1);

						var tmpQuery1 = testMeadow.query.clone()
							.addRecord({Name:'Red Riding Hood', Type:'Human'});
						testMeadow.doCreate(tmpQuery1,
							function(pError1, pQuery1, pQueryRead1, pRecord1)
							{
								Expect(pRecord1.IDAnimal).to.equal(3);
								Expect(pRecord1.Name).to.equal('Red Riding Hood');

								var tmpQuery2 = testMeadow.query.clone()
									.addRecord({Name:'Red', Type:'Dog'});
								testMeadow.doCreate(tmpQuery2,
									function(pError2, pQuery2, pQueryRead2, pRecord2)
									{
										Expect(pRecord2.IDAnimal).to.equal(4);

										var tmpQuery3 = testMeadow.query.clone()
											.addRecord({Name:'Spot', Type:'Dog'});
										testMeadow.doCreate(tmpQuery3,
											function(pError3, pQuery3, pQueryRead3, pRecord3)
											{
												Expect(pRecord3.IDAnimal).to.equal(5);

												var tmpQuery4 = testMeadow.query.clone()
													.addRecord({Name:'Gertrude', Type:'Frog'});
												testMeadow.doCreate(tmpQuery4,
													function(pError4, pQuery4, pQueryRead4, pRecord4)
													{
														Expect(pRecord4.IDAnimal).to.equal(6);
														fDone();
													}
												);
											}
										);
									}
								);
							}
						);
					}
				);

				test
				(
					'Create a record with pre-set Deleted flag',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(1);

						var tmpQuery = testMeadow.query.clone()
							.setDisableDeleteTracking(true)
							.addRecord({Name:'Charmander', Type:'Pokemon', Deleted: 1});

						testMeadow.doCreate(tmpQuery,
							function(pError, pQuery, pQueryRead, pRecord)
							{
								Expect(pRecord.Name).to.equal('Charmander');
								Expect(pRecord.Deleted).to.equal(1);
								Expect(pRecord.IDAnimal).to.equal(7);
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Read Operations',
			function()
			{
				test
				(
					'Read a single record by ID',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 1);

						testMeadow.doRead(tmpQuery,
							function(pError, pQuery, pRecord)
							{
								Expect(pRecord.IDAnimal)
									.to.equal(1);
								Expect(pRecord.Name)
									.to.equal('Foo Foo');
								Expect(pRecord.Type)
									.to.equal('Bunny');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read all records (doReads)',
					function(fDone)
					{
						var testMeadow = newMeadow();

						testMeadow.doReads(testMeadow.query,
							function(pError, pQuery, pRecords)
							{
								// Should return 6 records (excluding Charmander which is Deleted=1)
								Expect(pRecords.length)
									.to.equal(6);
								// Records come back in GUID key order, so use set-based assertions
								var tmpNames = pRecords.map(function(r) { return r.Name; });
								Expect(tmpNames).to.include('Foo Foo');
								Expect(tmpNames).to.include('Moose');
								Expect(tmpNames).to.include('Red Riding Hood');
								Expect(tmpNames).to.include('Red');
								Expect(tmpNames).to.include('Spot');
								Expect(tmpNames).to.include('Gertrude');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with equality filter',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('Type', 'Dog');

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								Expect(pRecords.length)
									.to.equal(2);
								// Records come back in GUID key order, so use set-based assertions
								var tmpNames = pRecords.map(function(r) { return r.Name; });
								Expect(tmpNames).to.include('Red');
								Expect(tmpNames).to.include('Spot');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with LIKE filter',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('Name', '%Red%', 'LIKE');

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								Expect(pRecords.length)
									.to.equal(2);
								// Should match "Red Riding Hood" and "Red"
								var tmpNames = pRecords.map(function(r) { return r.Name; });
								Expect(tmpNames).to.include('Red Riding Hood');
								Expect(tmpNames).to.include('Red');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with IN filter',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('Type', ['Bunny', 'Frog'], 'IN');

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								Expect(pRecords.length)
									.to.equal(2);
								var tmpTypes = pRecords.map(function(r) { return r.Type; });
								Expect(tmpTypes).to.include('Bunny');
								Expect(tmpTypes).to.include('Frog');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with comparison filter (>)',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 4, '>');

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								Expect(pRecords.length)
									.to.equal(2);
								// IDs 5 and 6 (not 7 since it's Deleted); order depends on GUID keys
								var tmpIDs = pRecords.map(function(r) { return r.IDAnimal; });
								Expect(tmpIDs).to.include(5);
								Expect(tmpIDs).to.include(6);
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with NOT IN filter',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('Type', ['Dog', 'Human', 'Frog', 'Mammal'], 'NOT IN');

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								// Should only be the Bunny
								Expect(pRecords.length)
									.to.equal(1);
								Expect(pRecords[0].Type)
									.to.equal('Bunny');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with sorting',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addSort({Column:'Name', Direction:'Descending'});

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								Expect(pRecords.length)
									.to.equal(6);
								// Alphabetically descending
								Expect(pRecords[0].Name)
									.to.equal('Spot');
								Expect(pRecords[pRecords.length - 1].Name)
									.to.equal('Foo Foo');
								fDone();
							}
						);
					}
				);

				test
				(
					'Read records with pagination (skip and limit)',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addSort({Column:'IDAnimal', Direction:'Ascending'})
							.setCap(2)
							.setBegin(1);

						testMeadow.doReads(tmpQuery,
							function(pError, pQuery, pRecords)
							{
								// Should skip 1 and return 2 (sorted by IDAnimal ascending)
								Expect(pRecords.length)
									.to.equal(2);
								Expect(pRecords[0].IDAnimal)
									.to.equal(2);
								Expect(pRecords[1].IDAnimal)
									.to.equal(3);
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Update Operations',
			function()
			{
				test
				(
					'Update a record in the database',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(42);

						var tmpQuery = testMeadow.query
							.addRecord({IDAnimal:3, Type:'Girl'});

						testMeadow.doUpdate(tmpQuery,
							function(pError, pQuery, pQueryRead, pRecord)
							{
								Expect(pRecord.Type)
									.to.equal('Girl');
								Expect(pRecord.Name)
									.to.equal('Red Riding Hood');
								Expect(pRecord.UpdatingIDUser)
									.to.equal(42);
								fDone();
							}
						);
					}
				);

				test
				(
					'Verify update persisted',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 3);

						testMeadow.doRead(tmpQuery,
							function(pError, pQuery, pRecord)
							{
								Expect(pRecord.Type)
									.to.equal('Girl');
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Count Operations',
			function()
			{
				test
				(
					'Count all non-deleted records',
					function(fDone)
					{
						var testMeadow = newMeadow();

						testMeadow.doCount(testMeadow.query,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(6);
								fDone();
							}
						);
					}
				);

				test
				(
					'Count records with filter',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('Type', 'Dog');

						testMeadow.doCount(tmpQuery,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(2);
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Delete Operations',
			function()
			{
				test
				(
					'Soft-delete a record',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(999);

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 6);

						testMeadow.doDelete(tmpQuery,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(1);
								fDone();
							}
						);
					}
				);

				test
				(
					'Verify soft-deleted record is excluded from reads',
					function(fDone)
					{
						var testMeadow = newMeadow();

						testMeadow.doReads(testMeadow.query,
							function(pError, pQuery, pRecords)
							{
								// Should now be 5 (Foo Foo, Moose, Red Riding Hood, Red, Spot)
								Expect(pRecords.length)
									.to.equal(5);
								var tmpIDs = pRecords.map(function(r) { return r.IDAnimal; });
								Expect(tmpIDs).to.not.include(6);
								fDone();
							}
						);
					}
				);

				test
				(
					'Verify soft-deleted record still exists with disableDeleteTracking',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.setDisableDeleteTracking(true)
							.addFilter('IDAnimal', 6);

						testMeadow.doRead(tmpQuery,
							function(pError, pQuery, pRecord)
							{
								Expect(pRecord.IDAnimal)
									.to.equal(6);
								Expect(pRecord.Deleted)
									.to.equal(1);
								// Note: Meadow's Delete behavior does not propagate IDUser
								// from meadow.setIDUser() (unlike Create and Update behaviors),
								// so DeletingIDUser will be the default (0).
								Expect(pRecord.DeletingIDUser)
									.to.equal(0);
								fDone();
							}
						);
					}
				);

				test
				(
					'Count excludes deleted records',
					function(fDone)
					{
						var testMeadow = newMeadow();

						testMeadow.doCount(testMeadow.query,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(5);
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Undelete Operations',
			function()
			{
				test
				(
					'Undelete a soft-deleted record',
					function(fDone)
					{
						var testMeadow = newMeadow().setIDUser(777);

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 6);

						testMeadow.doUndelete(tmpQuery,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(1);
								fDone();
							}
						);
					}
				);

				test
				(
					'Verify undeleted record is now visible',
					function(fDone)
					{
						var testMeadow = newMeadow();

						var tmpQuery = testMeadow.query
							.addFilter('IDAnimal', 6);

						testMeadow.doRead(tmpQuery,
							function(pError, pQuery, pRecord)
							{
								Expect(pRecord.IDAnimal)
									.to.equal(6);
								Expect(pRecord.Deleted)
									.to.equal(0);
								Expect(pRecord.Name)
									.to.equal('Gertrude');
								fDone();
							}
						);
					}
				);

				test
				(
					'Count now includes undeleted record',
					function(fDone)
					{
						var testMeadow = newMeadow();

						testMeadow.doCount(testMeadow.query,
							function(pError, pQuery, pCount)
							{
								Expect(pCount)
									.to.equal(6);
								fDone();
							}
						);
					}
				);
			}
		);

		suite
		(
			'Multiple Scopes',
			function()
			{
				test
				(
					'Create records in a different scope and verify isolation',
					function(fDone)
					{
						var testMeadow = require('../source/Meadow.js')
							.new(libFable, 'Vehicle')
							.setProvider('RocksDB')
							.setSchema([
								{ Column: "IDVehicle", Type:"AutoIdentity" },
								{ Column: "GUIDVehicle", Type:"AutoGUID" },
								{ Column: "CreateDate", Type:"CreateDate" },
								{ Column: "CreatingIDUser", Type:"CreateIDUser" },
								{ Column: "UpdateDate", Type:"UpdateDate" },
								{ Column: "UpdatingIDUser", Type:"UpdateIDUser" },
								{ Column: "Deleted", Type:"Deleted" },
								{ Column: "DeletingIDUser", Type:"DeleteIDUser" },
								{ Column: "DeleteDate", Type:"DeleteDate" }
							])
							.setDefaultIdentifier('IDVehicle')
							.setDefault({
								IDVehicle: null,
								GUIDVehicle: '',
								CreateDate: false,
								CreatingIDUser: 0,
								UpdateDate: false,
								UpdatingIDUser: 0,
								Deleted: 0,
								DeleteDate: false,
								DeletingIDUser: 0,
								Make: 'Unknown',
								Model: 'Unknown'
							});

						var tmpQuery = testMeadow.query.clone()
							.addRecord({Make:'Toyota', Model:'Camry'});

						testMeadow.doCreate(tmpQuery,
							function(pError, pQuery, pQueryRead, pRecord)
							{
								Expect(pRecord.Make).to.equal('Toyota');
								Expect(pRecord.IDVehicle).to.equal(1);

								// Now verify FableTest scope still has its 6 records
								var animalMeadow = newMeadow();
								animalMeadow.doCount(animalMeadow.query,
									function(pError2, pQuery2, pCount)
									{
										Expect(pCount).to.equal(6);
										fDone();
									}
								);
							}
						);
					}
				);
			}
		);

		suite
		(
			'Error Handling',
			function()
			{
				test
				(
					'Read with no connection should return error',
					function(fDone)
					{
						var tmpFable2 = new (require('fable'))({
							LogStreams: [{ level: 'fatal', streamtype: 'process.stdout' }]
						});

						var testMeadow = require('../source/Meadow.js')
							.new(tmpFable2, 'FableTest')
							.setProvider('RocksDB')
							.setSchema(_AnimalSchema)
							.setDefaultIdentifier('IDAnimal')
							.setDefault(_AnimalDefault);

						testMeadow.doReads(testMeadow.query,
							function(pError, pQuery, pRecords)
							{
								Expect(pError).to.exist;
								fDone();
							}
						);
					}
				);
			}
		);
	}
);
