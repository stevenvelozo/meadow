/**
* Unit tests for the Meadow "PostgreSQL" Provider
*
* These tests expect a PostgreSQL database.....
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

const libMeadowConnectionPostgreSQL = require('meadow-connection-postgresql');

var tmpFableSettings = (
	{
		"Product": "MeadowPostgreSQLTestBookstore",
		"ProductVersion": "1.0.0",

		"UUID":
		{
			"DataCenter": 0,
			"Worker": 0
		},
		"LogStreams":
			[
				{
					"streamtype": "console"
				}
			],

		"PostgreSQL":
		{
			"Server": "127.0.0.1",
			"Port": 35432,
			"User": "postgres",
			"Password": "testpassword",
			"Database": "bookstore",
			"ConnectionPoolLimit": 20
		}
	});

var libFable = new (require('fable'))(tmpFableSettings);

libFable.serviceManager.addServiceType('MeadowPostgreSQLProvider', libMeadowConnectionPostgreSQL);
libFable.serviceManager.instantiateServiceProvider('MeadowPostgreSQLProvider');

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
		{ Column: "IDAnimal", Type: "AutoIdentity" },
		{ Column: "GUIDAnimal", Type: "AutoGUID" },
		{ Column: "CreateDate", Type: "CreateDate" },
		{ Column: "CreatingIDUser", Type: "CreateIDUser" },
		{ Column: "UpdateDate", Type: "UpdateDate" },
		{ Column: "UpdatingIDUser", Type: "UpdateIDUser" },
		{ Column: "Deleted", Type: "Deleted" },
		{ Column: "DeletingIDUser", Type: "DeleteIDUser" },
		{ Column: "DeleteDate", Type: "DeleteDate" },
		{ Column: "Name", Type: "String" },
		{ Column: "Type", Type: "String" },
		{ Column: "Metadata",  Type:"JSON" },
		{ Column: "ExtraData", Type:"JSONProxy", StorageColumn:"ExtraDataJSON" }
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
		'Meadow-Provider-PostgreSQL',
		function ()
		{
			var _SpooledUp = false;

			var getAnimalInsert = function (pName, pType)
			{
				return 'INSERT INTO "FableTest" ("GUIDAnimal", "CreateDate", "CreatingIDUser", "UpdateDate", "UpdatingIDUser", "Deleted", "DeleteDate", "DeletingIDUser", "Name", "Type", "Metadata", "ExtraDataJSON") VALUES (\'00000000-0000-0000-0000-000000000000\', NOW(), 1, NOW(), 1, 0, NULL, 0, \'' + pName + '\', \'' + pType + '\', \'{}\', \'{}\'); ';
			};

			var newMeadow = function ()
			{
				return require('../source/Meadow.js')
					.new(libFable, 'FableTest')
					.setProvider('PostgreSQL')
					.setSchema(_AnimalSchema)
					.setJsonSchema(_AnimalJsonSchema)
					.setDefaultIdentifier('IDAnimal')
					.setDefault(_AnimalDefault)
			};

			suiteSetup
				(
					function (fDone)
					{
						// Only do this for the first test.
						if (!_SpooledUp)
						{
							// Tear down previous test data
							libFable.Utility.waterfall(
								[
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.connectAsync(
											(pError, pConnectionPool) =>
											{
												if (pError)
												{
													libFable.log.error(`Error connecting to PostgreSQL Database: ${pError}`);
													fStageComplete(pError);
												}

												libFable.log.info('Connection opened!');
												return fStageComplete();
											}
										);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query('DROP TABLE IF EXISTS "FableTest"').then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query('CREATE TABLE IF NOT EXISTS "FableTest" ("IDAnimal" SERIAL PRIMARY KEY, "GUIDAnimal" VARCHAR(36) NOT NULL DEFAULT \'00000000-0000-0000-0000-000000000000\', "CreateDate" TIMESTAMP, "CreatingIDUser" INT NOT NULL DEFAULT 0, "UpdateDate" TIMESTAMP, "UpdatingIDUser" INT NOT NULL DEFAULT 0, "Deleted" SMALLINT NOT NULL DEFAULT 0, "DeleteDate" TIMESTAMP, "DeletingIDUser" INT NOT NULL DEFAULT 0, "Name" VARCHAR(128) NOT NULL DEFAULT \'\', "Type" VARCHAR(128) NOT NULL DEFAULT \'\', "Metadata" TEXT, "ExtraDataJSON" TEXT);').then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query(getAnimalInsert('Foo Foo', 'Bunny')).then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query(getAnimalInsert('Red Riding Hood', 'Girl')).then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query(getAnimalInsert('Red', 'Dog')).then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query(getAnimalInsert('Spot', 'Dog')).then(() => { return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowPostgreSQLProvider.pool.query(getAnimalInsert('Gertrude', 'Frog')).then(() => { return fStageComplete(); }).catch(fStageComplete);
									}
								],
								function (pError, pResult)
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

			suiteTeardown((fDone) =>
			{
				if (libFable.MeadowPostgreSQLProvider && libFable.MeadowPostgreSQLProvider.pool)
				{
					libFable.MeadowPostgreSQLProvider.pool.end().then(() => fDone()).catch(fDone);
				}
				else
				{
					fDone();
				}
			});

			suite
				(
					'Object Sanity',
					function ()
					{
						test
							(
								'The PostgreSQL class should initialize itself into a happy little object.',
								function ()
								{
									var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('PostgreSQL');
									Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
								}
							);
					}
				);
			suite
				(
					'Query Processing',
					function ()
					{
						test
							(
								'Create a record in the database',
								function (fDone)
								{
									var testMeadow = newMeadow().setIDUser(90210);

									var tmpQuery = testMeadow.query.clone().setLogLevel(5)
										.addRecord({ Name: 'Blastoise', Type: 'Pokemon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Name)
												.to.equal('Blastoise');
											Expect(pRecord.CreatingIDUser)
												.to.equal(90210);
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record with JSON data',
								function (fDone)
								{
									var testMeadow = newMeadow().setIDUser(90210);

									var tmpQuery = testMeadow.query.clone().setLogLevel(5)
										.addRecord({ Name: 'Moose', Type: 'Mammal', Metadata: { habitat: 'forest', weight: 500 }, ExtraData: { endangered: false, population: 'stable' } });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
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
											// The storage column should not be exposed on the marshaled record
											Expect(pRecord).to.not.have.property('ExtraDataJSON');
											fDone();
										}
									)
								}
							);
						test
							(
								'Read a record from the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimal', 1);

									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.doReads(testMeadow.query.addSort({Column: 'IDAnimal'}),
										function (pError, pQuery, pRecords)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addRecord({ IDAnimal: 2, Type: 'Human' });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query.addFilter('IDAnimal', 3);

									testMeadow.doDelete(tmpQuery,
										function (pError, pQuery, pRecord)
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
								'Undelete a record in the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpDeleteQuery = testMeadow.query.addFilter('IDAnimal', 5);

									// Make sure the record is deleted!
									testMeadow.doDelete(tmpDeleteQuery,
										function (pDeleteError, pDeleteQuery, pDeleteRecord)
										{
											var tmpQuery = testMeadow.query.addFilter('IDAnimal', 5);
											testMeadow.doUndelete(tmpQuery,
												function (pError, pQuery, pRecord)
												{
													// It returns the number of rows undeleted
													Expect(pRecord)
														.to.equal(1);
													fDone();
												});
										});
								}
							);
						test
							(
								'Count all records from the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									Expect(testMeadow.query.parameters.result.executed)
										.to.equal(false);
									testMeadow.doCount(testMeadow.query,
										function (pError, pQuery, pRecord)
										{
											// There should be 6 records
											Expect(pRecord)
												.to.equal(6);
											Expect(pQuery.parameters.result.executed)
												.to.equal(true);
											fDone();
										}
									)
								}
							);
						test
							(
								'Perform operations with a schema-based instantiation',
								function (fDone)
								{
									var testMeadow = require('../source/Meadow.js').new(libFable)
										.loadFromPackage(__dirname + '/Animal.json').setProvider('PostgreSQL');

									// Make sure the authentication stuff got loaded
									Expect(testMeadow.schemaFull.authorizer.User)
										.to.be.an('object');
									Expect(testMeadow.schemaFull.authorizer.User.Create)
										.to.equal('Allow');

									var tmpQuery = testMeadow.query
										.addRecord({ Name: 'Grommet', Type: 'Dog' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Name)
												.to.equal('Grommet');
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
					function ()
					{
						test
							(
								'Create a record in the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addRecord({ Name: 'MewTwo', Type: 'Pokemon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
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
								'Create a record in the database with a predefined GUID',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addRecord({ Name: 'MewThree', GUIDAnimal: '0x12345', Type: 'Pokemon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Name)
												.to.equal('MewThree');
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with a previously predefined GUID -- expect failure',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addRecord({ Name: 'MewThree', GUIDAnimal: '0x12345', Type: 'Pokemon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal("Record with GUID 0x12345 already exists!");
											fDone();
										}
									)
								}
							);
						test
							(
								'Read a record from the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addFilter('IDAnimal', 1);

									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.doReads(testMeadow.query.setLogLevel(5).addSort({Column: 'IDAnimal'}),
										function (pError, pQuery, pRecords)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addRecord({ IDAnimal: 2, Type: 'HumanGirl' });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addFilter('IDAnimal', 4);

									testMeadow.doDelete(tmpQuery,
										function (pError, pQuery, pRecord)
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
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.doCount(testMeadow.query.setLogLevel(5),
										function (pError, pQuery, pRecord)
										{
											// There should be 8 records
											Expect(pRecord)
												.to.equal(8);
											fDone();
										}
									)
								}
							);
						test
							(
								'Read a record from the database that had a defined GUID',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('GUIDAnimal', '0x12345');

									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Name)
												.to.equal('MewThree');
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with a defined creating user',
								function (fDone)
								{
									var testMeadow = newMeadow();
									var tmpQuery = testMeadow.query
										.setIDUser(800)
										.addRecord({ Name: 'MewSix', GUIDAnimal: '0x123456', Type: 'Pokemon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Name)
												.to.equal('MewSix');
											Expect(pRecord.CreatingIDUser)
												.to.equal(800);
											fDone();
										}
									)
								}
							);
					}
				);
			suite
				(
					'The Bad Kind of Query Processing',
					function ()
					{
						test
							(
								'Create a record in the database with no record',
								function (fDone)
								{
									var testMeadow = newMeadow().setDefaultIdentifier('Type');

									testMeadow.doCreate(testMeadow.query,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal('No record submitted');
											fDone();
										}
									)
								}
							);
						test
							(
								'Read a record from the database with no data returned',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimal', 5000);
									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											Expect(pRecord)
												.to.equal(false);
											fDone();
										}
									)
								}
							);
						test
							(
								'Read records from the database with no data returned',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimal', 5000);

									testMeadow.doReads(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											Expect(pRecord.length)
												.to.equal(0);
											fDone();
										}
									)
								}
							);
						test
							(
								'Update a record in the database with a bad filter',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.setLogLevel(5)
										.addRecord({ IDAnimal: undefined, Type: 'HumanGirl' });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal('Automated update missing filters... aborting!');
											fDone();
										}
									)
								}
							);
						test
							(
								'Update a record in the database without passing a record in',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.doUpdate(testMeadow.query,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal('No record submitted');
											fDone();
										}
									)
								}
							);
						test
							(
								'Update a record in the database with a bad record passed in (no default identifier)',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addRecord({ Name: 'Bill' });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal('Automated update missing default identifier');
											fDone();
										}
									)
								}
							);
						test
							(
								'Update a record in the database that does not exist',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addRecord({ IDAnimal: 983924 });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError)
												.to.equal('No record found to update!');
											fDone();
										}
									)
								}
							);
					}
				);
		}
	);
