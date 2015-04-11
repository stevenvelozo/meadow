/**
* Meadow Provider - MySQL
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow-Schema
*/


var libMySQL = require('mysql2');
var libFoxHound = require('foxhound');

var MeadowProvider = function()
{
	function createNew(pFable)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || (!pFable.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}
		var _Fable = pFable;

		/**
		 * Build a connection pool, shared within this provider.
		 * This may be more performant as a shared object.
		 */
		var _SQLConnectionPool = libMySQL.createPool
		(
			{
				connectionLimit: _Fable.settings.MySQL.ConnectionPoolLimit,
				host: _Fable.settings.MySQL.Server,
				port: _Fable.settings.MySQL.Port,
				user: _Fable.settings.MySQL.User,
				password: _Fable.settings.MySQL.Password,
				database: _Fable.settings.MySQL.Database
			}
		);

		/**
		 * Get a raw MySQL connection object
		 *
		 * @method getMySQLConnection
		 */
		var getMySQLConnection = function()
		{
			return mysql.createConnection
			(
				{
					user: _Settings.MySQL.User,
					password: _Settings.MySQL.Password,
					host: _Settings.MySQL.Server,
					ssl: 'Amazon RDS'
				}
			);
		};

		var createRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			// Meadow providers expect an extra array in the query, "records" when creating
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var readRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			_CommonServices.getMySQLConnectionPool().query
			(
				// We are using foreignID as the version within the old schema, to eliminate the need for changes.
				"SELECT HDLT_OBSERVATIONS.id, HDLT_OBSERVATIONS.name, HDLT_OBSERVATIONS.type, HDLT_OBSERVATIONS.description, HDLT_OBSERVATIONS.definition, HDLT_OBSERVATIONS.projectID, HDLT_OBSERVATIONS.foreignID, HDLT_OBSERVATIONS.created_at, HDLT_OBSERVATIONS.updated_at, HDLT_OBSERVATIONS.deleted, HDLT_OBSERVATIONS.deletedByID, HDLT_OBSERVATIONS.createdByID, HDLT_OBSERVATIONS.parent, HDLT_OBSERVATIONS.description, HDLT_OBSERVATIONS.gpsLocation, HDLT_OBSERVATIONS.attributedLocation, HDLT_OBSERVATIONS.definition, HDLT_OBSERVATIONS.complete, HDLT_OBSERVATIONS.designatedTime, trueDesignatedTime FROM HDLT_OBSERVATIONS LEFT JOIN HDLT_USER_PROJECT_XREF ON HDLT_USER_PROJECT_XREF.projectID = HDLT_OBSERVATIONS.projectID WHERE HDLT_OBSERVATIONS.projectID = ? AND HDLT_OBSERVATIONS.deleted = 0 AND HDLT_USER_PROJECT_XREF.userID = ? ORDER BY HDLT_OBSERVATIONS.id DESC",
				[tmpIDProject, tmpIDUser],
				function(pError, pRows, pFields)
				{
					if (pError)
					{
						_CommonServices.log.warn('Error in getObservations Attempt DB Call: ', {RequestID:pRequest.RequestUUID,Error:pError});
						return _CommonServices.sendError('Observation list failure.', pRequest, pResponse, fNext);
					}

					if (pRows.length < 1)
					{
						_CommonServices.log.warn('Failed Observation list: No observations for project '+tmpIDProject, {RequestID:pRequest.RequestUUID});
						pResponse.send([]);
						return tmpNext();
					}
					else
					{
						var tmpObservationSet = createObservationSet();
						asyncMarshalObservationResults(tmpObservationSet, pRows,
							function()
							{
								// Populate the artifacts from the observation details
								libObservationLegacyAdapter.marshalDBLegacyObservationDetails(tmpObservationSet,
									function ()
									{
										_CommonServices.log.info('Successfully delivered Observation list', {RequestID:pRequest.RequestUUID,Action:'ListObservations'});
										pResponse.send(tmpObservationSet.Observations);
										return tmpNext();
									});
							});
					}
				}
			);
			// This returns nothing because it's the none data provider!
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var updateRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			// Meadow providers expect an extra array in the query, "records" when updating
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var deleteRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var tmpNewProvider = (
		{
			setSchema: setSchema,
			validateObject: validateObject,

			new: createNew
		});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
