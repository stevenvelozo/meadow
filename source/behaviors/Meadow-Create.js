// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
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
			// Step 0: If GUID is specified, make sure the record does not already exist
			function (fStageComplete)
			{
				// Make sure the user submitted a record
				if (!pQuery.query.records)
				{
					return fStageComplete('No record submitted', pQuery, false);
				}

				if (pQuery.query.records[0][pMeadow.defaultGUIdentifier] &&
					pQuery.query.records[0][pMeadow.defaultGUIdentifier].length >= 5) //see Foxhound mysql build create query: GUID min len must be 5
				{
					var tmpGUIDRecord = pQuery.query.records[0][pMeadow.defaultGUIdentifier];

					var tmpQueryRead = pQuery.clone().addFilter(pMeadow.defaultGUIdentifier, tmpGUIDRecord)
												 .setDisableDeleteTracking(true); //this check is to guarantee uniqueness across the entire table, so always do this

					if (pMeadow.rawQueries.checkQuery('Read'))
					{
						tmpQueryRead.parameters.queryOverride = pMeadow.rawQueries.getQuery('Read');
					}
					pMeadow.provider.Read(tmpQueryRead, function()
						{
							var tmpError = tmpQueryRead.error;

							if (!tmpError &&
								tmpQueryRead.result.value.length > 0)
							{
								tmpError = 'Record with GUID ' + tmpGUIDRecord + ' already exists!';
							}

							if (tmpError)
							{
								return fStageComplete(tmpError, tmpQueryRead, tmpQueryRead, null);
							}
							else
							{
								return fStageComplete();
							}
						});
				}
				else
				{
					return fStageComplete();
				}
			},
			// Step 1: Create the record in the data source
			function (fStageComplete)
			{
				if (!pQuery.query.IDUser)
				{
					// The user ID is not already set, set it magically.
					if (typeof(pQuery.userID) === 'number' && (pQuery.userID % 1) === 0 && pQuery.userID >= 0)
						pQuery.query.IDUser = pQuery.userID;
					else
						pQuery.query.IDUser = pMeadow.userIdentifier;
				}
				
				// Merge in the default record with the passed-in record for completeness
				pQuery.query.records[0] = libUnderscore.extend({}, pMeadow.schemaFull.defaultObject, pQuery.query.records[0]);
				// Create override is too complex ... punting for now
				// if (pMeadow.rawQueries.checkQuery('Create'))
				//	pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Create');
				pMeadow.provider.Create(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Setup a read operation
			function (pQuery, fStageComplete)
			{
				// The value is not set (it should be set to the value for our DefaultIdentifier)
				if (pQuery.parameters.result.value === false)
				{
					return fStageComplete('Creation failed', pQuery, false);
				}

				var tmpIDRecord = pQuery.result.value;
				fStageComplete(pQuery.result.error, pQuery, tmpIDRecord);
			},
			// Step 3: Read the record
			function (pQuery, pIDRecord, fStageComplete)
			{
				var tmpQueryRead = pQuery.clone().addFilter(pMeadow.defaultIdentifier, pIDRecord)
												 .setDisableDeleteTracking(pQuery.parameters.query.disableDeleteTracking); //if delete tracking is disabled, we need to disable it on this Read operation

				if (pMeadow.rawQueries.checkQuery('Read'))
				{
					tmpQueryRead.parameters.queryOverride = pMeadow.rawQueries.getQuery('Read');
				}
				pMeadow.provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
			},
			// Step 4: Marshal the record into a POJO
			function (pQuery, pQueryRead, fStageComplete)
			{
				// Ensure there is not at least one record returned
				if (pQueryRead.parameters.result.value.length < 1)
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
				pMeadow.fable.log.warn('Error during the create waterfall', {Error:pError, Message: pError.message, Query: pQuery.query, Stack: pError.stack});
			}
			fCallBack(pError, pQuery, pQueryRead, pRecord);
		}
	);

	return pMeadow;
};

module.exports = meadowBehaviorCreate;