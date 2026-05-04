#!/usr/bin/env node
// mssql-runner.js — sqlcmd-equivalent for the test-database scripts.
//
// Replaces `docker exec <container> /opt/mssql-tools.../sqlcmd ...` with a
// host-side connection over the mapped port. Avoids depending on tooling
// the SQL Server image happens to bundle (which varies — Azure SQL Edge's
// :latest, for example, has dropped the in-container sqlcmd binary).
//
// Modes:
//   --readiness                  Probe-and-retry until the engine accepts a
//                                login + SELECT 1. Exit 0 when ready.
//   --query "<SQL>"              Run a single statement and exit.
//   (stdin, no mode flag)        Read SQL from stdin, split on `^GO$` lines,
//                                execute each batch in order.
//
// Connection parameters via env (with defaults that match mssql-test-db.sh):
//   MSSQL_HOST     127.0.0.1
//   MSSQL_PORT     31433
//   MSSQL_USER     sa
//   MSSQL_PASSWORD 1234567890abc.
//   MSSQL_DATABASE master   (override with --db <name>)

const libTedious = require('tedious');

const tmpArgs = process.argv.slice(2);
const tmpMode = (() =>
{
	if (tmpArgs.includes('--readiness')) return 'readiness';
	const tmpQueryIdx = tmpArgs.indexOf('--query');
	if (tmpQueryIdx >= 0) return 'query';
	return 'stdin';
})();

const tmpDBIdx = tmpArgs.indexOf('--db');
const tmpDatabase = (tmpDBIdx >= 0 && tmpArgs[tmpDBIdx + 1]) ? tmpArgs[tmpDBIdx + 1] : (process.env.MSSQL_DATABASE || 'master');

const tmpQueryIdx = tmpArgs.indexOf('--query');
const tmpInlineQuery = (tmpQueryIdx >= 0 && tmpArgs[tmpQueryIdx + 1]) ? tmpArgs[tmpQueryIdx + 1] : null;

const tmpConfig =
{
	server: process.env.MSSQL_HOST || '127.0.0.1',
	authentication:
	{
		type: 'default',
		options:
		{
			userName: process.env.MSSQL_USER || 'sa',
			password: process.env.MSSQL_PASSWORD || '1234567890abc.'
		}
	},
	options:
	{
		port: parseInt(process.env.MSSQL_PORT || '31433', 10),
		database: tmpDatabase,
		// TLS with cert trust — matches sqlcmd -C and what newer SQL Server
		// / Azure SQL Edge images expect by default. trustServerCertificate
		// is required for the self-signed cert the container generates.
		encrypt: true,
		trustServerCertificate: true,
		// Default 15s timeout cuts off readiness probing on slow startups.
		// Bump it so the probe loop owns the retry cadence, not tedious.
		connectTimeout: 60000,
		requestTimeout: 60000,
		rowCollectionOnRequestCompletion: false
	}
};

function connect()
{
	return new Promise((fResolve, fReject) =>
	{
		const tmpConnection = new libTedious.Connection(tmpConfig);
		tmpConnection.on('connect', (pError) =>
		{
			if (pError) return fReject(pError);
			return fResolve(tmpConnection);
		});
		tmpConnection.connect();
	});
}

function execSql(pConnection, pSQL)
{
	return new Promise((fResolve, fReject) =>
	{
		const tmpRequest = new libTedious.Request(pSQL, (pError) =>
		{
			if (pError) return fReject(pError);
			return fResolve();
		});
		pConnection.execSql(tmpRequest);
	});
}

function close(pConnection)
{
	return new Promise((fResolve) =>
	{
		pConnection.on('end', fResolve);
		pConnection.close();
	});
}

// Split a multi-batch script on `^GO$` lines (case-insensitive, trimmed).
// sqlcmd's GO separator is a batch delimiter, not a SQL keyword — it must
// appear alone on its own line.
function splitBatches(pScript)
{
	const tmpLines = pScript.split(/\r?\n/);
	const tmpBatches = [];
	let tmpCurrent = [];
	for (const tmpLine of tmpLines)
	{
		if (/^\s*GO\s*$/i.test(tmpLine))
		{
			const tmpJoined = tmpCurrent.join('\n').trim();
			if (tmpJoined.length > 0) tmpBatches.push(tmpJoined);
			tmpCurrent = [];
		}
		else
		{
			tmpCurrent.push(tmpLine);
		}
	}
	const tmpTail = tmpCurrent.join('\n').trim();
	if (tmpTail.length > 0) tmpBatches.push(tmpTail);
	return tmpBatches;
}

async function runReadiness()
{
	const tmpMaxRetries = parseInt(process.env.MSSQL_RUNNER_RETRIES || '60', 10);
	const tmpSleepMs = parseInt(process.env.MSSQL_RUNNER_SLEEP_MS || '2000', 10);
	for (let i = 0; i < tmpMaxRetries; i++)
	{
		try
		{
			const tmpConn = await connect();
			await execSql(tmpConn, 'SELECT 1');
			await close(tmpConn);
			return;
		}
		catch (pError)
		{
			const tmpRemaining = tmpMaxRetries - 1 - i;
			if (tmpRemaining <= 0)
			{
				console.error(`ERROR: MSSQL not ready after ${tmpMaxRetries} attempts: ${pError.message}`);
				process.exit(1);
			}
			console.log(`  ...waiting (${tmpRemaining} retries left)`);
			await new Promise((fResolve) => setTimeout(fResolve, tmpSleepMs));
		}
	}
}

async function runQuery(pSQL)
{
	const tmpConn = await connect();
	try
	{
		await execSql(tmpConn, pSQL);
	}
	finally
	{
		await close(tmpConn);
	}
}

async function runStdin()
{
	const tmpChunks = [];
	for await (const tmpChunk of process.stdin) tmpChunks.push(tmpChunk);
	const tmpScript = Buffer.concat(tmpChunks).toString('utf8');
	const tmpBatches = splitBatches(tmpScript);
	if (tmpBatches.length < 1) return;

	const tmpConn = await connect();
	try
	{
		for (const tmpBatch of tmpBatches)
		{
			await execSql(tmpConn, tmpBatch);
		}
	}
	finally
	{
		await close(tmpConn);
	}
}

(async () =>
{
	try
	{
		if (tmpMode === 'readiness') await runReadiness();
		else if (tmpMode === 'query') await runQuery(tmpInlineQuery);
		else await runStdin();
		process.exit(0);
	}
	catch (pError)
	{
		console.error(`mssql-runner: ${pError.message}`);
		process.exit(1);
	}
})();
