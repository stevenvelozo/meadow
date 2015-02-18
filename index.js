var tmpFH = require('../foxhound');

tmpFH.setLogLevel(3);

tmpFH.setScope('Users');

console.log('Scope:'+tmpFH.parameters.scope + ' DataElements:' + tmpFH.parameters.dataElements + ' Begin:'+tmpFH.parameters.begin)

tmpFH.buildFetchQuery();

console.log('Query: '+tmpFH.query.body)