/**
* Unit tests for the Meadow "MSSQL" Provider
*
* These tests expect a MSSQL database.....
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

const libMeadowConnectionMSSQL = require('meadow-connection-mssql');

var tmpFableSettings = (
	{
		"Product": "MeadowMSSQLTestBookstore",
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

		"MSSQL":
		{
			"server": "127.0.0.1",
			"port": 3306,
			"user": "sa",
			"password": "1234567890abc.",
			"database": "bookstore",
			"ConnectionPoolLimit": 20
		}
	});

var libFable = new (require('fable'))(tmpFableSettings);

libFable.serviceManager.addServiceType('MeadowMSSQLProvider', libMeadowConnectionMSSQL);
libFable.serviceManager.instantiateServiceProvider('MeadowMSSQLProvider');

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
		{ Column: "Age", Type: "Integer" }
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
		'Meadow-Provider-MSSQL',
		function ()
		{
			var _SpooledUp = false;

			var getAnimalInsert = function (pName, pType)
			{
				return "INSERT INTO FableTest (GUIDAnimal, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser, Deleted, DeleteDate, DeletingIDUser, Name, Type) VALUES ('00000000-0000-0000-0000-000000000000', GETUTCDATE(), 1, GETUTCDATE(), 1, 0, NULL, 0, '" + pName + "', '" + pType + "'); ";
			};

			var newMeadow = function ()
			{
				return require('../source/Meadow.js')
					.new(libFable, 'FableTest')
					.setProvider('MSSQL')
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
										libFable.MeadowMSSQLProvider.connectAsync(
											(pError, pConnectionPool) =>
											{
												if (pError)
												{
													libFable.log.error(`Error connecting to MS SQL Database: ${pError}`);
													fStageComplete(pError);
												}

												libFable.log.info('Connection opened!');
												return fStageComplete();
											}
										);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query('DROP TABLE IF EXISTS FableTest').then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query("CREATE TABLE FableTest (IDAnimal INT IDENTITY(1,1) NOT NULL, GUIDAnimal VARCHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000', CreateDate DATETIME, CreatingIDUser INT NOT NULL DEFAULT '0', UpdateDate DATETIME, UpdatingIDUser INT NOT NULL DEFAULT '0', Deleted TINYINT NOT NULL DEFAULT '0', DeleteDate DATETIME, DeletingIDUser INT NOT NULL DEFAULT '0', Name VARCHAR(128) NOT NULL DEFAULT '', Type VARCHAR(128) NOT NULL DEFAULT '' );").then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query(getAnimalInsert('Foo Foo', 'Bunny')).then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query(getAnimalInsert('Red Riding Hood', 'Girl')).then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query(getAnimalInsert('Red', 'Dog')).then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query(getAnimalInsert('Spot', 'Dog')).then(()=>{ return fStageComplete(); }).catch(fStageComplete);
									},
									function (fStageComplete)
									{
										libFable.MeadowMSSQLProvider.pool.query(getAnimalInsert('Gertrude', 'Frog')).then(()=>{ return fStageComplete(); }).catch(fStageComplete);
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
				//_SQLConnectionPool.end(fDone);
			}
			);

			suite
				(
					'Object Sanity',
					function ()
					{
						test
							(
								'The MSSQL class should initialize itself into a happy little object.',
								function ()
								{
									var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('MSSQL');
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

									// Ensure this query is "slow"...
									testMeadow.fable.settings.QueryThresholdWarnTime = 1;

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
											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;
											fDone();
										}
									)
								}
							);
						test
							(
								'New provider format',
								function (fDone)
								{
									let _FableClass = require('fable');
									let _Fable = new _FableClass({
										MSSQL:
										{
											// This is queued up for Travis defaults.
											Server: "localhost",
											Port: 3306,
											User: "root",
											Password: "123456789",
											Database: "FableTest",
											ConnectionPoolLimit: 20
										},
										MeadowConnectionMSSQLAutoConnect: true
									});
									_Fable.serviceManager.addAndInstantiateServiceType('MeadowMSSQLProvider', require('meadow-connection-mssql'));

									var testMeadow = require('../source/Meadow.js')
										.new(_Fable, 'FableTest')
										.setProvider('MSSQL')
										.setSchema(_AnimalSchema)
										.setJsonSchema(_AnimalJsonSchema)
										.setDefaultIdentifier('IDAnimal')
										.setDefault(_AnimalDefault);

									testMeadow.setIDUser(90210);

									var tmpQuery = testMeadow.query.addFilter('IDAnimal', 1);

									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.IDAnimal)
												.to.equal(1);
											Expect(pRecord.Name)
												.to.equal('Foo Foo');

											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with Deleted bit already set',
								function (fDone)
								{
									var testMeadow = newMeadow().setIDUser(90210);

									var tmpQuery = testMeadow.query.clone().setLogLevel(5)
										.setDisableDeleteTracking(true)
										.addRecord({ Name: 'Blastoise', Type: 'Pokemon', Deleted: true });

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
								'Read a record from the database',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.fable.settings.QueryThresholdWarnTime = 1;

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

											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

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

									testMeadow.doReads(testMeadow.query,
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

									testMeadow.fable.settings.QueryThresholdWarnTime = 1;

									var tmpQuery = testMeadow.query
										.addRecord({ IDAnimal: 2, Type: 'Human' });

									testMeadow.doUpdate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have a record ....
											Expect(pRecord.Type)
												.to.equal('Human');

											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

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

									testMeadow.fable.settings.QueryThresholdWarnTime = 1;
									var tmpQuery = testMeadow.query.addFilter('IDAnimal', 3);

									testMeadow.doDelete(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											// It returns the number of rows deleted
											Expect(pRecord)
												.to.equal(1);

											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

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

									testMeadow.fable.settings.QueryThresholdWarnTime = 1;
									var tmpDeleteQuery = testMeadow.query.addFilter('IDAnimal', 5);

									// Make sure the record is deleted!
									testMeadow.doDelete(tmpDeleteQuery,
										function (pDeleteError, pDeleteQuery, pDeleteRecord)
										{
											var tmpQuery = testMeadow.query.addFilter('IDAnimal', 5);
											testMeadow.doUndelete(tmpQuery,
												function (pError, pQuery, pRecord)
												{
													// It returns the number of rows deleted
													Expect(pRecord)
														.to.equal(1);

													testMeadow.fable.settings.QueryThresholdWarnTime = 1000;

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
									testMeadow.fable.settings.QueryThresholdWarnTime = 1;

									Expect(testMeadow.query.parameters.result.executed)
										.to.equal(false);
									testMeadow.doCount(testMeadow.query,
										function (pError, pQuery, pRecord)
										{
											// There should be 5 records
											Expect(pRecord)
												.to.equal(5);
											Expect(pQuery.parameters.result.executed)
												.to.equal(true);
											testMeadow.fable.settings.QueryThresholdWarnTime = 1000;
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
										.loadFromPackage(__dirname + '/Animal.json').setProvider('MSSQL');

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

									testMeadow.doReads(testMeadow.query.setLogLevel(5),
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
											// There should be 7 records
											Expect(pRecord)
												.to.equal(7);
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
											Expect(pRecord.IDAnimal)
												.to.equal(10);
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
								'Count all records from the database from a nonexistent table',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.doCount(testMeadow.query.setScope('BadTable'),
										function (pError, pQuery, pRecord)
										{
											Expect(pError.code)
												.to.equal("ER_NO_SUCH_TABLE");
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with an invalid default identifier',
								function (fDone)
								{
									var testMeadow = newMeadow().setDefaultIdentifier('BadIdentifier');

									var tmpQuery = testMeadow.query
										.addRecord({ Name: 'Scaley', Type: 'Chameleon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have no record because the default id is IDFableTest and our tables identity is IDAnimal
											Expect(pError.code)
												.to.equal('ER_BAD_FIELD_ERROR');
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with the wrong default identifier',
								function (fDone)
								{
									var testMeadow = newMeadow().setDefaultIdentifier('Type');

									var tmpQuery = testMeadow.query
										.addRecord({ Name: 'Tina', Type: 'Chameleon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have no record because the default id is IDFableTest and our tables identity is IDAnimal
											Expect(pError)
												.to.equal('No record found after create.');
											fDone();
										}
									)
								}
							);
						test
							(
								'Create a record in the database with no record',
								function (fDone)
								{
									var testMeadow = newMeadow().setDefaultIdentifier('Type');

									testMeadow.doCreate(testMeadow.query,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											// We should have no record because the default id is IDFableTest and our tables identity is IDAnimal
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
								'Read records from the database with an invalid query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimalFarmGeorge', 5000);

									testMeadow.doReads(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											Expect(pError.code)
												.to.equal('ER_BAD_FIELD_ERROR');
											fDone();
										}
									)
								}
							);
						test
							(
								'Read a single record from the database with an invalid query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimalFarmGeorge', 5000);

									testMeadow.doRead(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											Expect(pError.code)
												.to.equal('ER_BAD_FIELD_ERROR');
											fDone();
										}
									)
								}
							);
						test
							(
								'Delete with a bad query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									var tmpQuery = testMeadow.query
										.addFilter('IDAnimalHouse', 4);

									testMeadow.doDelete(tmpQuery,
										function (pError, pQuery, pRecord)
										{
											Expect(pError.code)
												.to.equal('ER_BAD_FIELD_ERROR');
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
											// We should have a record ....
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
						test
							(
								'Set a raw Query',
								function (fDone)
								{
									var testMeadow = newMeadow();
									testMeadow.rawQueries.setQuery('Read', 'SELECT Something from SomethingElse;');

									Expect(testMeadow.rawQueries.getQuery('Read'))
										.to.equal('SELECT Something from SomethingElse;');
									fDone();
								}
							);
						test
							(
								'Load a raw Query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.rawQueries.loadQuery('Read', __dirname + '/Meadow-Provider-MSSQL-AnimalReadQuery.sql',
										function (pSuccess)
										{
											Expect(testMeadow.rawQueries.getQuery('Read'))
												.to.contain('SELECT');
											fDone();
										});
								}
							);
						test
							(
								'Load a bad raw Query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.rawQueries.loadQuery('Read', __dirname + '/Meadow-Provider-MSSQL-BADAnimalReadQuery.sql',
										function (pSuccess)
										{
											Expect(testMeadow.rawQueries.getQuery('Read'))
												.to.equal('');
											fDone();
										});
								}
							);
						test
							(
								'Load a raw query with no callback',
								function ()
								{
									var testMeadow = newMeadow();

									testMeadow.rawQueries.loadQuery('Read', __dirname + '/Meadow-Provider-MSSQL-AnimalReadQuery.sql');
								}
							);
						test
							(
								'Check for a query that is not there',
								function ()
								{
									var testMeadow = newMeadow();
									Expect(testMeadow.rawQueries.getQuery('Read'))
										.to.equal(false);
								}
							);
						test
							(
								'Read a record from a custom query',
								function (fDone)
								{
									var testMeadow = newMeadow();

									testMeadow.rawQueries.loadQuery('Read', __dirname + '/Meadow-Provider-MSSQL-AnimalReadQuery.sql',
										function (pSuccess)
										{
											// Now try to read the record
											testMeadow.doRead(testMeadow.query.addFilter('IDAnimal', 2),
												function (pError, pQuery, pRecord)
												{
													Expect(pRecord.AnimalTypeCustom)
														.to.equal('Bunny');
													fDone();
												}
											)
										});
								}
							);
						test
							(
								'Read records from a custom query, then delete one, then read them again then update and create.',
								function (fDone)
								{
									var testMeadow = newMeadow();
									testMeadow.setDefaultIdentifier('IDAnimal');
									testMeadow.rawQueries.setQuery('Delete', 'DELETE FROM FableTest WHERE IDAnimal = 1;')
									testMeadow.rawQueries.setQuery('Count', 'SELECT 1337 AS RowCount;')
									testMeadow.rawQueries.setQuery('Read', 'SELECT IDAnimal, Type AS AnimalTypeCustom FROM FableTest <%= Where %>')
									testMeadow.rawQueries.setQuery('Update', "UPDATE FableTest SET Type = 'FrogLeg' <%= Where %>")

									// And this, my friends, is why we use async.js
									testMeadow.rawQueries.loadQuery('Reads', __dirname + '/Meadow-Provider-MSSQL-AnimalReadQuery.sql',
										function (pSuccess)
										{
											// Now try to read the record
											testMeadow.doReads(testMeadow.query.addFilter('IDAnimal', 2),
												function (pError, pQuery, pRecords)
												{
													Expect(pRecords[1].AnimalTypeCustom)
														.to.equal('HumanGirl');
													testMeadow.doDelete(testMeadow.query.addFilter('IDAnimal', 2),
														function (pError, pQuery, pRecord)
														{
															// It returns the number of rows deleted
															Expect(pRecord)
																.to.equal(1);
															testMeadow.doCount(testMeadow.query.addFilter('IDAnimal', 2),
																function (pError, pQuery, pRecord)
																{
																	// It returns the number of rows deleted
																	Expect(pRecord)
																		.to.equal(1337);
																	var tmpQuery = testMeadow.query
																		.addRecord({ IDAnimal: 5, Type: 'Bartfast' });

																	testMeadow.doUpdate(tmpQuery,
																		function (pError, pQuery, pQueryRead, pRecord)
																		{
																			// We should have a record ....
																			Expect(pRecord.AnimalTypeCustom)
																				.to.equal('Bartfast');
																			var tmpQuery = testMeadow.query
																				.addRecord({ Name: 'Bambi', Type: 'CustomSheep' });

																			testMeadow.doCreate(tmpQuery,
																				function (pError, pQuery, pQueryRead, pRecord)
																				{
																					// We should have a record ....
																					Expect(pRecord.AnimalTypeCustom)
																						.to.equal('CustomSheep');
																					fDone();
																				}
																			)
																		}
																	)
																}
															)
														}
													)
												}
											)
										}
									);
								}
							);
						test
							(
								'Create a record in the database with bad fields',
								function (fDone)
								{
									var testMeadow = newMeadow();
									// NOTE: Bad fields passed in are polluting the schema forever.
									var tmpQuery = testMeadow.query
										.addRecord({ Name: 'Tina', TypeWriter: 'Chameleon' });

									testMeadow.doCreate(tmpQuery,
										function (pError, pQuery, pQueryRead, pRecord)
										{
											Expect(pError.code)
												.to.equal('ER_BAD_FIELD_ERROR');
											fDone();
										}
									)
								}
							);
					}
				);
		}
	);
