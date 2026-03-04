/**
 * Headless browser integration tests for the Meadow SQLite provider
 * using meadow-connection-sqlite-browser (sql.js / WASM).
 *
 * Verifies the full Meadow ORM CRUD pipeline works in a real browser:
 *   Fable → MeadowConnectionSQLiteBrowser → Meadow DAL → doCreate/doRead/doUpdate/doDelete
 *
 * Loads four bundles in headless Chrome:
 *   1) sql-wasm.js (global initSqlJs)
 *   2) fable.min.js from CDN (global Fable)
 *   3) meadow.js from dist/ (global Meadow)
 *   4) meadow-connection-sqlite-browser.js from connection package dist/ (global MeadowConnectionSqliteBrowser)
 *
 * Requires:
 *   - npm run build (so meadow dist/ exists)
 *   - meadow-connection-sqlite-browser built (its dist/ must exist)
 *   - puppeteer installed
 *
 * @license     MIT
 * @author      Steven Velozo <steven@velozo.com>
 */

var Chai = require('chai');
var Expect = Chai.expect;

var libHTTP = require('http');
var libFS = require('fs');
var libPath = require('path');

var _MeadowRoot = libPath.resolve(__dirname, '..');
var _MeadowDistDir = libPath.join(_MeadowRoot, 'dist');

// Resolve connection package paths
var _ConnectionPackageRoot = libPath.resolve(_MeadowRoot, '..', 'meadow-connection-sqlite-browser');
var _ConnectionDistDir = libPath.join(_ConnectionPackageRoot, 'dist');
var _SqlJsDistDir = libPath.join(_ConnectionPackageRoot, 'node_modules', 'sql.js', 'dist');

// Fable loaded from CDN
var _FABLE_CDN_URL = 'https://cdn.jsdelivr.net/npm/fable@3/dist/fable.min.js';

/**
 * Create a simple HTTP server that serves the static files needed
 * for the browser test page.
 *
 * @param {function} fCallback - Callback with (pError, pServer, pPort)
 */
function startTestServer(fCallback)
{
	var tmpMimeTypes =
	{
		'.html': 'text/html',
		'.js': 'application/javascript',
		'.wasm': 'application/wasm',
		'.map': 'application/json'
	};

	var tmpServer = libHTTP.createServer(
		function(pRequest, pResponse)
		{
			var tmpUrl = pRequest.url;

			// Route: /  → test page
			if (tmpUrl === '/' || tmpUrl === '/index.html')
			{
				pResponse.writeHead(200, { 'Content-Type': 'text/html' });
				pResponse.end(generateTestHTML());
				return;
			}

			// Route: /sql-wasm.js, /sql-wasm.wasm → from sql.js dist
			if (tmpUrl === '/sql-wasm.js' || tmpUrl === '/sql-wasm.wasm')
			{
				serveFile(libPath.join(_SqlJsDistDir, tmpUrl.slice(1)), pResponse, tmpMimeTypes);
				return;
			}

			// Route: /meadow.js → from meadow dist/
			if (tmpUrl === '/meadow.js')
			{
				serveFile(libPath.join(_MeadowDistDir, 'meadow.js'), pResponse, tmpMimeTypes);
				return;
			}

			// Route: /meadow-connection-sqlite-browser.js → from connection dist/
			if (tmpUrl.startsWith('/meadow-connection-sqlite-browser'))
			{
				serveFile(libPath.join(_ConnectionDistDir, tmpUrl.slice(1)), pResponse, tmpMimeTypes);
				return;
			}

			pResponse.writeHead(404);
			pResponse.end('Not Found');
		});

	tmpServer.listen(0, '127.0.0.1',
		function()
		{
			var tmpPort = tmpServer.address().port;
			return fCallback(null, tmpServer, tmpPort);
		});
}

/**
 * Serve a static file.
 *
 * @param {string} pFilePath - Absolute path
 * @param {object} pResponse - HTTP response
 * @param {object} pMimeTypes - Extension → MIME type map
 */
function serveFile(pFilePath, pResponse, pMimeTypes)
{
	if (!libFS.existsSync(pFilePath))
	{
		pResponse.writeHead(404);
		pResponse.end('File not found: ' + pFilePath);
		return;
	}

	var tmpExt = libPath.extname(pFilePath);
	var tmpContentType = pMimeTypes[tmpExt] || 'application/octet-stream';

	var tmpContent = libFS.readFileSync(pFilePath);
	pResponse.writeHead(200, { 'Content-Type': tmpContentType });
	pResponse.end(tmpContent);
}

/**
 * Generate the test HTML page.
 *
 * Exercises the full Meadow CRUD pipeline in the browser:
 *   Fable → register MeadowSQLiteProvider → connectAsync → create table →
 *   seed data → Meadow.new() → setProvider('SQLite') → doCreate/doRead/
 *   doReads/doUpdate/doDelete/doCount
 *
 * @returns {string} HTML content
 */
function generateTestHTML()
{
	return `<!DOCTYPE html>
<html>
<head><title>Meadow SQLiteBrowser Headless CRUD Tests</title></head>
<body>
<h1>Meadow CRUD — Headless Browser</h1>
<pre id="output">Running tests...</pre>

<!-- 1) sql.js WASM loader -->
<script src="/sql-wasm.js"></script>

<!-- 2) Fable from CDN -->
<script src="${_FABLE_CDN_URL}"></script>

<!-- 3) Meadow ORM (includes foxhound + providers) -->
<script src="/meadow.js"></script>

<!-- 4) Browser SQLite connection provider -->
<script src="/meadow-connection-sqlite-browser.js"></script>

<script>
(async function runTests()
{
	var results = [];
	var output = document.getElementById('output');

	function addResult(pName, pPassed, pError)
	{
		results.push({ name: pName, passed: pPassed, error: pError || null });
		output.textContent += '\\n' + (pPassed ? 'PASS' : 'FAIL') + ': ' + pName;
		if (pError) { output.textContent += ' (' + pError + ')'; }
	}

	// Wrap Meadow callback-style CRUD in promises for sequential await
	function promisify(pFn)
	{
		return function()
		{
			var args = Array.prototype.slice.call(arguments);
			return new Promise(function(resolve, reject)
			{
				args.push(function()
				{
					// Meadow callbacks vary: (err, query, record) or (err, query, queryRead, record)
					var cbArgs = Array.prototype.slice.call(arguments);
					var err = cbArgs[0];
					if (err) { return reject(err); }
					resolve(cbArgs);
				});
				pFn.apply(null, args);
			});
		};
	}

	try
	{
		// ---- Test 1: Globals available ----
		addResult('globals available',
			typeof Fable === 'function'
			&& typeof Meadow === 'object'
			&& typeof Meadow.new === 'function'
			&& typeof MeadowConnectionSqliteBrowser === 'function'
			&& typeof initSqlJs === 'function'
		);

		// ---- Test 2: Create Fable and register connection ----
		var fable = new Fable({
			Product: 'MeadowBrowserCRUD',
			ProductVersion: '1.0.0',
			LogStreams: [{ streamtype: 'console' }]
		});
		fable.serviceManager.addServiceType('MeadowSQLiteProvider', MeadowConnectionSqliteBrowser);
		var sqliteConn = fable.serviceManager.instantiateServiceProvider('MeadowSQLiteProvider');
		addResult('fable + connection registered',
			fable.isFable === true
			&& typeof fable.MeadowSQLiteProvider === 'object'
		);

		// ---- Test 3: connectAsync ----
		await new Promise(function(resolve, reject)
		{
			sqliteConn.connectAsync(function(pError)
			{
				if (pError) { return reject(pError); }
				addResult('connectAsync succeeded', sqliteConn.connected === true);
				resolve();
			});
		});

		// ---- Test 4: Create table and seed data ----
		var db = sqliteConn.db;
		db.exec(
			"CREATE TABLE IF NOT EXISTS FableTest (" +
			"  IDAnimal INTEGER PRIMARY KEY AUTOINCREMENT," +
			"  GUIDAnimal TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'," +
			"  CreateDate TEXT," +
			"  CreatingIDUser INTEGER NOT NULL DEFAULT 0," +
			"  UpdateDate TEXT," +
			"  UpdatingIDUser INTEGER NOT NULL DEFAULT 0," +
			"  Deleted INTEGER NOT NULL DEFAULT 0," +
			"  DeleteDate TEXT," +
			"  DeletingIDUser INTEGER NOT NULL DEFAULT 0," +
			"  Name TEXT NOT NULL DEFAULT ''," +
			"  Type TEXT NOT NULL DEFAULT ''" +
			");"
		);
		var ins = db.prepare(
			"INSERT INTO FableTest (GUIDAnimal, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser, Deleted, Name, Type) " +
			"VALUES ('00000000-0000-0000-0000-000000000000', datetime('now'), 1, datetime('now'), 1, 0, ?, ?)"
		);
		ins.run('Foo Foo', 'Bunny');
		ins.run('Red Riding Hood', 'Girl');
		ins.run('Red', 'Dog');
		ins.run('Spot', 'Dog');
		ins.run('Gertrude', 'Frog');

		var seedCheck = db.prepare('SELECT COUNT(*) AS cnt FROM FableTest').get();
		addResult('table created and seeded', seedCheck.cnt === 5);

		// ---- Set up Meadow DAL ----
		var animalSchema = [
			{ Column: 'IDAnimal',       Type: 'AutoIdentity' },
			{ Column: 'GUIDAnimal',     Type: 'AutoGUID' },
			{ Column: 'CreateDate',     Type: 'CreateDate' },
			{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
			{ Column: 'UpdateDate',     Type: 'UpdateDate' },
			{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
			{ Column: 'Deleted',        Type: 'Deleted' },
			{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
			{ Column: 'DeleteDate',     Type: 'DeleteDate' }
		];
		var animalJsonSchema = {
			title: 'Animal',
			description: 'A creature that lives in a meadow.',
			type: 'object',
			properties: {
				IDAnimal: { description: 'The unique identifier for an animal', type: 'integer' },
				Name: { description: "The animal's name", type: 'string' },
				Type: { description: 'The type of the animal', type: 'string' }
			},
			required: ['IDAnimal', 'Name', 'CreatingIDUser']
		};
		var animalDefault = {
			IDAnimal: null, GUIDAnimal: '',
			CreateDate: false, CreatingIDUser: 0,
			UpdateDate: false, UpdatingIDUser: 0,
			Deleted: 0, DeleteDate: false, DeletingIDUser: 0,
			Name: 'Unknown', Type: 'Unclassified'
		};

		function newMeadow()
		{
			return Meadow.new(fable, 'FableTest')
				.setProvider('SQLite')
				.setSchema(animalSchema)
				.setJsonSchema(animalJsonSchema)
				.setDefaultIdentifier('IDAnimal')
				.setDefault(animalDefault);
		}

		// ---- Test 5: doCreate ----
		var dal = newMeadow().setIDUser(90210);
		var createResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.clone().addRecord({ Name: 'Blastoise', Type: 'Pokemon' });
			dal.doCreate(q, function(pError, pQuery, pQueryRead, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doCreate',
			createResult.Name === 'Blastoise'
			&& createResult.CreatingIDUser === 90210
			&& typeof createResult.IDAnimal === 'number'
		);

		// ---- Test 6: doRead ----
		dal = newMeadow();
		var readResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('IDAnimal', 1);
			dal.doRead(q, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doRead',
			readResult.IDAnimal === 1
			&& readResult.Name === 'Foo Foo'
		);

		// ---- Test 7: doReads ----
		dal = newMeadow();
		var readsResult = await new Promise(function(resolve, reject)
		{
			dal.doReads(dal.query, function(pError, pQuery, pRecords)
			{
				if (pError) { return reject(pError); }
				resolve(pRecords);
			});
		});
		addResult('doReads',
			Array.isArray(readsResult)
			&& readsResult.length >= 5
			&& readsResult[0].Name === 'Foo Foo'
			&& readsResult[1].Name === 'Red Riding Hood'
		);

		// ---- Test 8: doUpdate ----
		dal = newMeadow();
		var updateResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addRecord({ IDAnimal: 2, Type: 'Human' });
			dal.doUpdate(q, function(pError, pQuery, pQueryRead, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doUpdate',
			updateResult.Type === 'Human'
			&& updateResult.IDAnimal === 2
		);

		// ---- Test 9: doDelete ----
		dal = newMeadow();
		var deleteResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('IDAnimal', 3);
			dal.doDelete(q, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doDelete', deleteResult === 1);

		// ---- Test 10: doUndelete ----
		dal = newMeadow();
		// First delete #5
		await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('IDAnimal', 5);
			dal.doDelete(q, function(pError) { pError ? reject(pError) : resolve(); });
		});
		dal = newMeadow();
		var undeleteResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('IDAnimal', 5);
			dal.doUndelete(q, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doUndelete', undeleteResult === 1);

		// ---- Test 11: doCount ----
		dal = newMeadow();
		var countResult = await new Promise(function(resolve, reject)
		{
			dal.doCount(dal.query, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doCount',
			typeof countResult === 'number'
			&& countResult >= 4
		);

		// ---- Test 12: doCreate with predefined GUID ----
		dal = newMeadow();
		var guidResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.clone().addRecord({
				Name: 'MewThree', GUIDAnimal: '0xBROWSER123', Type: 'Pokemon'
			});
			dal.doCreate(q, function(pError, pQuery, pQueryRead, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doCreate with predefined GUID',
			guidResult.Name === 'MewThree'
			&& guidResult.GUIDAnimal === '0xBROWSER123'
		);

		// ---- Test 13: doRead by GUID ----
		dal = newMeadow();
		var guidReadResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('GUIDAnimal', '0xBROWSER123');
			dal.doRead(q, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doRead by GUID',
			guidReadResult.Name === 'MewThree'
		);

		// ---- Test 14: doRead with no match returns false ----
		dal = newMeadow();
		var noMatchResult = await new Promise(function(resolve, reject)
		{
			var q = dal.query.addFilter('IDAnimal', 99999);
			dal.doRead(q, function(pError, pQuery, pRecord)
			{
				if (pError) { return reject(pError); }
				resolve(pRecord);
			});
		});
		addResult('doRead no match returns false', noMatchResult === false);
	}
	catch (pError)
	{
		addResult('unexpected error', false, pError.message || String(pError));
	}

	window.__TEST_RESULTS__ = results;
	window.__TESTS_COMPLETE__ = true;
	output.textContent += '\\n\\nDone: '
		+ results.filter(function(r) { return r.passed; }).length + '/'
		+ results.length + ' passed';
})();
</script>
</body>
</html>`;
}

suite
(
	'Meadow-Provider-SQLiteBrowser-Headless',
	function()
	{
		this.timeout(60000);

		var _Server;
		var _Port;
		var _Browser;
		var _Puppeteer;

		suiteSetup
		(
			function(fDone)
			{
				// Verify meadow dist exists
				if (!libFS.existsSync(libPath.join(_MeadowDistDir, 'meadow.js')))
				{
					return fDone(new Error(
						'dist/meadow.js not found. Run "npm run build" in the meadow package first.'
					));
				}

				// Verify connection package dist exists
				if (!libFS.existsSync(libPath.join(_ConnectionDistDir, 'meadow-connection-sqlite-browser.js')))
				{
					return fDone(new Error(
						'meadow-connection-sqlite-browser dist not found. Run "npm run build" in that package first.'
					));
				}

				// Verify sql.js dist exists
				if (!libFS.existsSync(libPath.join(_SqlJsDistDir, 'sql-wasm.js')))
				{
					return fDone(new Error(
						'sql.js dist files not found. Run "npm install" in meadow-connection-sqlite-browser first.'
					));
				}

				// Start the test server
				startTestServer(
					function(pError, pServer, pPort)
					{
						if (pError)
						{
							return fDone(pError);
						}
						_Server = pServer;
						_Port = pPort;

						try
						{
							_Puppeteer = require('puppeteer');
						}
						catch (pRequireError)
						{
							_Server.close();
							return fDone(new Error(
								'puppeteer is not installed. Add it as a devDependency and run npm install.'
							));
						}

						return fDone();
					});
			}
		);

		suiteTeardown
		(
			function(fDone)
			{
				var tmpSteps = [];

				if (_Browser)
				{
					tmpSteps.push(_Browser.close().catch(function() {}));
				}

				Promise.all(tmpSteps).then(
					function()
					{
						if (_Server)
						{
							_Server.close(fDone);
						}
						else
						{
							fDone();
						}
					});
			}
		);

		test
		(
			'Full Meadow CRUD pipeline works in headless Chrome',
			function(fDone)
			{
				_Puppeteer.launch(
					{
						headless: true,
						args: ['--no-sandbox', '--disable-setuid-sandbox']
					})
					.then(
						function(pBrowser)
						{
							_Browser = pBrowser;
							return _Browser.newPage();
						})
					.then(
						function(pPage)
						{
							pPage.on('console',
								function(pMessage)
								{
									if (pMessage.type() === 'error')
									{
										console.log('  [browser error]', pMessage.text());
									}
								});

							pPage.on('pageerror',
								function(pError)
								{
									console.log('  [browser page error]', pError.message);
								});

							return pPage.goto('http://127.0.0.1:' + _Port + '/', { waitUntil: 'networkidle0', timeout: 30000 })
								.then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							return pPage.waitForFunction(
								'window.__TESTS_COMPLETE__ === true',
								{ timeout: 30000 }
							).then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							return pPage.evaluate(function()
							{
								return window.__TEST_RESULTS__;
							});
						})
					.then(
						function(pResults)
						{
							Expect(pResults).to.be.an('array');
							Expect(pResults.length).to.be.above(0);

							var tmpFailures = [];

							for (var i = 0; i < pResults.length; i++)
							{
								if (!pResults[i].passed)
								{
									tmpFailures.push(
										pResults[i].name + (pResults[i].error ? ': ' + pResults[i].error : '')
									);
								}
							}

							if (tmpFailures.length > 0)
							{
								Expect.fail(
									'Browser CRUD tests failed:\n  - ' + tmpFailures.join('\n  - ')
								);
							}

							console.log('    ' + pResults.length + ' browser CRUD sub-tests passed');
							fDone();
						})
					.catch(
						function(pError)
						{
							fDone(pError);
						});
			}
		);
	}
);
