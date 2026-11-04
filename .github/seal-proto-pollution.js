// CVE-2019-11358 exploit check for the built jQuery files that ship in the
// tarball, including the stray jQuery 3.0.0-beta1 slim build (see
// seal-slim.js), which the QUnit suite never loads: a deep jQuery.extend of
// an object with an own "__proto__" key must not pollute Object.prototype.
// "vulnerable" asserts that every file IS polluted (run on the unpatched slim
// build, it shows the check exercises the attack); "fixed" asserts none is.
// Usage: node .github/seal-proto-pollution.js <vulnerable|fixed> <file>...
"use strict";

var path = require( "path" ),
	mode = process.argv[ 2 ],
	files = process.argv.slice( 3 );

if ( ( mode !== "vulnerable" && mode !== "fixed" ) || !files.length ) {
	console.error( "Usage: node seal-proto-pollution.js <vulnerable|fixed> <file>..." );
	process.exit( 2 );
}

require( "jsdom" ).env( "", function( errors, window ) {
	var failed = false;

	if ( errors ) {
		console.error( errors );
		process.exit( 1 );
	}

	files.forEach( function( file, i ) {
		var key = "sealPolluted" + i,
			jQuery = require( path.resolve( file ) )( window ),
			polluted;

		jQuery.extend( true, {}, JSON.parse( "{\"__proto__\": {\"" + key + "\": true}}" ) );
		polluted = key in {};
		delete Object.prototype[ key ];

		console.log( file + " (jQuery " + jQuery.fn.jquery + "): Object.prototype " +
			( polluted ? "polluted" : "not polluted" ) );
		if ( polluted !== ( mode === "vulnerable" ) ) {
			failed = true;
		}
	} );

	if ( failed ) {
		console.error( "ERROR: expected every file to be " + mode );
	}
	process.exit( failed ? 1 : 0 );
} );
