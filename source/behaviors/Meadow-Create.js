/**
* Meadow Behavior - Create
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');
var libUnderscore = require('underscore');

/**
* Meadow Behavior - Create
*
* @function meadowBehaviorCreate
*/
var meadowBehaviorCreate = function(pMeadow, pQuery, fCallBack)
{
	libAsync.waterfall(
		[
			// Step 1: Create the record in the data source
			function (fStageComplete)
			{
				pQuery.query.IDUser = pMeadow.userIdentifier;
				// Make sure the user submitted a record
				if (!pQuery.query.records)
				{
					return fStageComplete('No record submitted', pQuery, false);
				}
				// Merge in the default record with the passed-in record for completeness
				pQuery.query.records[0] = libUnderscore.extend(pMeadow.schemaFull.defaultObject, pQuery.query.records[0]);
				// Create override is too complex ... punting for now
				// if (pMeadow.rawQueries.checkQuery('Create'))
				//	pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Create');
				pMeadow.provider.Create(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Setup a read operation
			function (pQuery, fStageComplete)
			{
				if (
						// The query wasn't run yet
						(pQuery.parameters.result.executed == false) || 
						// The value is not set (it should be set to the value for our DefaultIdentifier)
						(pQuery.parameters.result.value === false)
					)
				{
					return fStageComplete('Creation failed', pQuery, false);
				}

				var tmpIDRecord = pQuery.result.value;
				fStageComplete(pQuery.result.error, pQuery, tmpIDRecord);
			},
			// Step 3: Read the record
			function (pQuery, pIDRecord, fStageComplete)
			{
				var tmpQueryRead = pQuery.clone().addFilter(pMeadow.defaultIdentifier, pIDRecord);
				if (pMeadow.rawQueries.checkQuery('Read'))
					tmpQueryRead.parameters.queryOverride = pMeadow.rawQueries.getQuery('Read');
				pMeadow.provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
			},
			// Step 4: Marshal the record into a POJO
			function (pQuery, pQueryRead, fStageComplete)
			{
				if (
						// The value is not an array
						(!Array.isArray(pQueryRead.parameters.result.value)) ||
						// There is not at least one record returned
						(pQueryRead.parameters.result.value.length < 1)
					)
				{
					return fStageComplete('No record found after create.', pQuery, pQueryRead, false);
				}

				var tmpRecord = pMeadow.marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
				fStageComplete(pQuery.result.error, pQuery, pQueryRead, tmpRecord);
			}
		],
		function(pError, pQuery, pQueryRead, pRecord)
		{
			if (pError)
			{
				pMeadow.fable.log.warn('Error during the create waterfall', {Error:pError, Query: pQuery.query});
			}
			fCallBack(pError, pQuery, pQueryRead, pRecord);
		}
	);

	return pMeadow;
}

module.exports = meadowBehaviorCreate;