/**
* @license MIT
* @author <steven@velozo.com>
*/
let libMeadowProviderBase = require('./Meadow-Provider-Base.js');

class MeadowProviderMySQL extends libMeadowProviderBase
{
	constructor(pMeadow)
	{
		super(pMeadow);
	}

	/**
	 * Build a connection pool, shared within this provider.
	 * This may be more performant as a shared object.
	 */
	getSQLPool()
	{
		if (typeof(_Fable.MeadowMySQLConnectionPool) !== 'object')
		{
			// This is going to be problematic.
			this.Meadow.log.fatal('Meadow is trying to perform queries without a valid [Fable.MeadowMySQLConnectionPool] object.  See the documentation for how to initialize one.');
			return false;
		}

		return _Fable.MeadowMySQLConnectionPool;
	};

	// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
	marshalRecordFromSourceToObject(pObject, pRecord, pSchema)
	{
		// For now, crudely assign everything in pRecord to pObject
		// This is safe in this context, and we don't want to slow down marshalling with millions of hasOwnProperty checks
		for(let tmpColumn in pRecord)
		{
			pObject[tmpColumn] = pRecord[tmpColumn];
		}
	};

	Create(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildCreateQuery();

		// TODO: Test the query before executing
		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows, pColumnNames)
				{
					pDBConnection.release();
					tmpResult.error = pError;
					tmpResult.value = false;

					try
					{
						tmpResult.value = pRows.insertId;
					}
					catch(pErrorGettingRowcount)
					{
						this.Meadow.log.warn('Error getting insert ID during create query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}

					tmpResult.executed = true;
					return fCallback();
				}
			);
		});
	};

	// This is a synchronous read, good for a few records.
	// TODO: Add a pipe-able read for huge sets
	Read(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildReadQuery();

		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows, pColumnNames)
				{
					pDBConnection.release();
					tmpResult.error = pError;
					tmpResult.value = pRows;
					tmpResult.executed = true;
					return fCallback();
				}
			);
		});
	};

	Update(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildUpdateQuery();

		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows)
				{
					pDBConnection.release();
					tmpResult.error = pError;
					tmpResult.value = pRows;
					tmpResult.executed = true;
					return fCallback();
				}
			);
		});
	}

	Delete(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildDeleteQuery();

		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows)
				{
					pDBConnection.release();
					tmpResult.error = pError;
					tmpResult.value = false;
					try
					{
						tmpResult.value = pRows.affectedRows;
					}
					catch(pErrorGettingRowcount)
					{
						this.Meadow.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}
					tmpResult.executed = true;
					return fCallback();
				}
			);
		});
	};

	Undelete(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildUndeleteQuery();

		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query
			(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows)
				{
					pDBConnection.release();
					tmpResult.error = pError;
					tmpResult.value = false;
					try
					{
						tmpResult.value = pRows.affectedRows;
					}
					catch(pErrorGettingRowcount)
					{
						this.Meadow.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}
					tmpResult.executed = true;
					return fCallback();
				}
			);
		});
	};

	Count(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect('MySQL').buildCountQuery();

		if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.parameters);
		}

		this.getSQLPool().getConnection(function(pError, pDBConnection)
		{
			pDBConnection.query(
				pQuery.query.body,
				pQuery.query.parameters,
				// The MySQL library also returns the Fields as the third parameter
				function(pError, pRows)
				{
					pDBConnection.release();
					tmpResult.executed = true;
					tmpResult.error = pError;
					tmpResult.value = false;
					try
					{
						tmpResult.value = pRows[0].RowCount;
					}
					catch(pErrorGettingRowcount)
					{
						this.Meadow.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
					}
					return fCallback();
				}
			);
		});
	};
};

module.exports = MeadowProviderMySQL;
