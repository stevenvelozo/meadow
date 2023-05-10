/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* ### Meadow Raw Query Library
*
* This library stores raw queries for FoxHound to use.
*
* You can overload the default query that is built for each of
* the following query archetypes:
*
* `Create`, `Read`, `Reads`, `Update`, `Delete`, `Count`
*
* You can also load other custom queries and give them an
* arbitrary name.
*
*/
class MeadowRawQuery
{
	constructor(pMeadow)
	{
		this.meadow = pMeadow;
		this.fable = this.meadow.fable;

		this.queries = {};
	}

	setQuery(pQueryTag, pQueryString)
	{
		this.queries[pQueryTag] = pQueryString;
		return this.meadow;
	}

	getQuery(pQueryTag)
	{
		if (this.queries.hasOwnProperty(pQueryTag))
		{
			return this.queries[pQueryTag];
		}

		return false;
	}

	checkQuery(pQueryTag)
	{
		return this.queries.hasOwnProperty(pQueryTag);
	}
}

module.exports = MeadowRawQuery;
