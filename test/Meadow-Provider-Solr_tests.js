/**
* Unit tests for the Meadow "Solr" Provider
*
* These tests expect a Solr instance.....
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

const libMeadowConnectionSolr = require('meadow-connection-solr');

var tmpFableSettings = (
	{
		"Product": "MeadowSolrTestBookstore",
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

		"Solr":
		{
			"Server": "127.0.0.1",
			"Port": 38983,
			"Core": "meadow_test"
		}
	});

var libFable = new (require('fable'))(tmpFableSettings);

libFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
libFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');

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
		{ Column: "Type", Type: "String" }
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
		'Meadow-Provider-Solr',
		function ()
		{
			var _SpooledUp = false;

			var newMeadow = function ()
			{
				return require('../source/Meadow.js')
					.new(libFable, 'FableTest')
					.setProvider('Solr')
					.setSchema(_AnimalSchema)
					.setJsonSchema(_AnimalJsonSchema)
					.setDefaultIdentifier('IDAnimal')
					.setDefault(_AnimalDefault)
			};

			suiteSetup
				(
					function (fDone)
					{
						this.timeout(30000);
						if (!_SpooledUp)
						{
							libFable.MeadowSolrProvider.connectAsync(
								(pError) =>
								{
									if (pError)
									{
										libFable.log.error(`Error connecting to Solr: ${pError}`);
										return fDone(pError);
									}

									var tmpClient = libFable.MeadowSolrProvider.pool;

									// Delete all existing documents
									tmpClient.deleteByQuery('*:*', function (pDeleteError)
									{
										if (pDeleteError)
										{
											return fDone(pDeleteError);
										}
										tmpClient.commit(function (pCommitError)
										{
											if (pCommitError)
											{
												return fDone(pCommitError);
											}

											var tmpNow = new Date().toISOString();

											// Seed the counter document
											var tmpCounterDoc = { id: 'FableTest.IDAnimal', seq: 5 };

											// Seed 5 animals + counter
											var tmpDocs = [
												tmpCounterDoc,
												{ id: 'FableTest-1', IDAnimal: 1, GUIDAnimal: '00000000-0000-0000-0000-000000000000', CreateDate: tmpNow, CreatingIDUser: 1, UpdateDate: tmpNow, UpdatingIDUser: 1, Deleted: 0, DeleteDate: '', DeletingIDUser: 0, Name: 'Foo Foo', Type: 'Bunny' },
												{ id: 'FableTest-2', IDAnimal: 2, GUIDAnimal: '00000000-0000-0000-0000-000000000000', CreateDate: tmpNow, CreatingIDUser: 1, UpdateDate: tmpNow, UpdatingIDUser: 1, Deleted: 0, DeleteDate: '', DeletingIDUser: 0, Name: 'Red Riding Hood', Type: 'Girl' },
												{ id: 'FableTest-3', IDAnimal: 3, GUIDAnimal: '00000000-0000-0000-0000-000000000000', CreateDate: tmpNow, CreatingIDUser: 1, UpdateDate: tmpNow, UpdatingIDUser: 1, Deleted: 0, DeleteDate: '', DeletingIDUser: 0, Name: 'Red', Type: 'Dog' },
												{ id: 'FableTest-4', IDAnimal: 4, GUIDAnimal: '00000000-0000-0000-0000-000000000000', CreateDate: tmpNow, CreatingIDUser: 1, UpdateDate: tmpNow, UpdatingIDUser: 1, Deleted: 0, DeleteDate: '', DeletingIDUser: 0, Name: 'Spot', Type: 'Dog' },
												{ id: 'FableTest-5', IDAnimal: 5, GUIDAnimal: '00000000-0000-0000-0000-000000000000', CreateDate: tmpNow, CreatingIDUser: 1, UpdateDate: tmpNow, UpdatingIDUser: 1, Deleted: 0, DeleteDate: '', DeletingIDUser: 0, Name: 'Gertrude', Type: 'Frog' }
											];

											tmpClient.add(tmpDocs, function (pAddError)
											{
												if (pAddError)
												{
													return fDone(pAddError);
												}
												tmpClient.commit(function (pFinalCommitError)
												{
													if (pFinalCommitError)
													{
														return fDone(pFinalCommitError);
													}
													_SpooledUp = true;
													fDone();
												});
											});
										});
									});
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
				if (libFable.MeadowSolrProvider && libFable.MeadowSolrProvider.pool)
				{
					var tmpClient = libFable.MeadowSolrProvider.pool;
					tmpClient.deleteByQuery('*:*', function (pDeleteError)
					{
						if (pDeleteError) return fDone(pDeleteError);
						tmpClient.commit(function ()
						{
							fDone();
						});
					});
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
								'The Solr class should initialize itself into a happy little object.',
								function ()
								{
									var testMeadow = require('../source/Meadow.js').new(libFable).setProvider('Solr');
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
											// We should have records ....
											Expect(pRecords[0].IDAnimal)
												.to.equal(1);
											Expect(pRecords[0].Name)
												.to.equal('Foo Foo');
											Expect(pRecords[1].IDAnimal)
												.to.equal(2);
											Expect(pRecords[1].Name)
												.to.equal('Red Riding Hood');
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
											// There should be 5 records (5 seeded + 1 created - 1 deleted = 5 non-deleted)
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
											// We should have records ....
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
											// Solr auto-filters Deleted=0, so count is non-deleted records only
											Expect(pRecord)
												.to.equal(5);
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
											// Solr returns 0 (not an object) when no docs match the filter,
											// so Meadow-Update Step 2 returns 'No record updated.'
											Expect(pError)
												.to.equal('No record updated.');
											fDone();
										}
									)
								}
							);
					}
				);
		}
	);
