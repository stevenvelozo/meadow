/**
* Unit tests for Meadow
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

suite
(
	'Meadow',
	function()
	{
		var testMeadow = false;

		setup
		(
			function()
			{
				testMeadow = require('../source/Meadow.js');
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					function()
					{
						Expect(testMeadow).to.be.an('object', 'Meadow should initialize as an object directly from the require statement.');
					}
				);
				test
				(
					'There should be some basic metadata on the class parameters',
					function()
					{
						Expect(testMeadow).to.have.a.property('scope')
						.that.is.a('string'); // Scope is always a string

						Expect(testMeadow).to.have.a.property('uuid')
						.that.is.a('string')
						.that.is.not.empty;
					}
				);
			}
		);
	}
);