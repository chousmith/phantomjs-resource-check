// phantomjs-resource-check resource_check.js
var page = require('webpage').create(),
    system = require('system'),
    firstloaded = false,
    t, address;

// how long should we wait for the page to load before we exit (in ms)
var WAIT_TIME = 5000;

// how long after page "load" to output our summary?
var BUFFER_TIME = 1000;

// if the page hasn't loaded yet, something is probably wrong
var MAX_EXECUTION_TIME = 15000;

// output error messages
var DEBUG = false;

// a list of regular expressions of resources (urls) to log when we load them
var resources_to_log = [
  [ new RegExp('.ttf'), 'font' ],
  [ new RegExp('.otf'), 'font' ],
  [ new RegExp('.png'), 'img' ],
  [ new RegExp('.jpg'), 'img' ],
  [ new RegExp('.jpeg'), 'img' ],
  [ new RegExp('.gif'), 'img' ],
  [ new RegExp('.js'), 'js' ],
  [ new RegExp('.css'), 'css' ],
  [ new RegExp('^https://www.facebook.com/tr/*'), 'fb' ],
  [ new RegExp('^https://dev.visualwebsiteoptimizer.com*'), 'vwo' ],
  [ new RegExp('^https://static.hotjar.com/c/hotjar*'), 'hotjar' ],
  [ new RegExp('^http(s)?://(www|ssl)\.google-analytics\.com.*'), 'ga' ],
  [ new RegExp('^http(s)?://stats\.g\.doubleclick\.net.*'), 'ga' ],
  [ new RegExp('^https://www.googletagmanager.com*'), 'gtm' ]
];

var resources_summary = [
  ['gtm', []],
  ['ga', []],
  ['hotjar', []],
  ['vwo', []],
  ['fb', []],
  ['css', []],
  ['js', []],
  ['img', []],
  ['font', []]
];
var resources_summary_key = {};
// dynamically generate our quick key store hash something
var l = resources_summary.length;
while(l--) {
  resources_summary_key[resources_summary[l][0]] = l;
}

// check we have a url, if not exit
if (system.args.length === 1) {
  console.log('Usage: get_ga_resources.js <some URL>');
  phantom.exit(1);
}// else {

t = Date.now();
// address is the url passed
address = system.args[1];

//console.log('You called this with '+ system.args.length +' args...');
if ( system.args.length > 3 ) {
  // assume the 3rd and 4th args are basic auth u&p?
  page.settings.userName = system.args[2];
  page.settings.password = system.args[3];
}

// create a function that is called every time a resource is requested
// http://phantomjs.org/api/webpage/handler/on-resource-requested.html
page.onResourceRequested = function(requestData, networkRequest) {
  //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
  if (DEBUG) {
    console.log('Request (#' + requestData.id + '): ' + requestData.url);
  }

  // loop round all our regexs to see if this url matches any of them
  var length = resources_to_log.length;
  while(length--) {
    if (resources_to_log[length][0].test(requestData.url)){
      // we have a match, log it
      var matchtype = resources_to_log[length][1];

      if (DEBUG) {
        console.log('###');
        console.log('Found a '+ matchtype +' resources_to_log match');
        console.log(requestData.url);
        console.log('###');
      }

      resources_summary[ resources_summary_key[ matchtype ] ][1].push(requestData.url);
    }
  }
};

// page.onResourceReceived = function(response) {
//   console.log('Receive ' + JSON.stringify(response, undefined, 4));
// };

// if debug is true, log errors, else ignore them
page.onError = function(msg, trace){
  if (DEBUG) {
    console.log('ERROR: ' + msg)
    console.log(trace)
  }
};

// make a note of any errors so we can print them out
page.onResourceError = function(resourceError) {
  page.reason = resourceError.errorString;
  page.reason_url = resourceError.url;
};

// http://phantomjs.org/api/webpage/handler/on-load-finished.html
page.onLoadFinished = function(status) {
  if ( !firstloaded ) {
    t = Date.now() - t;
    setTimeout( function() {
      console.log('Page loaded in '+ ( t/1000 ) +' seconds with Status = '+ status );
      console.log('--------------------------------------------------');
      if ( DEBUG ) {
        console.log('Then we waited '+ (BUFFER_TIME/1000) +' seconds to output this summary..');
        console.log('resources_summary_key ::' + JSON.stringify(resources_summary_key));
      }

      for( var i in resources_summary ) {
        if ( DEBUG ) {
          console.log('* '+ resources_summary[i][0] + ' : '+ resources_summary[i][1].length );
        }
        switch ( resources_summary[i][0] ) {
          case 'gtm':
            if ( resources_summary[i][1].length == 0 ) {
              console.log('No Google Tag Manager found?');
            } else {
              for ( var s in resources_summary[i][1] ) {
                if ( DEBUG ) {
                  console.log( resources_summary[i][1][s] );
                }
                // search each for an id
                var gtmd = resources_summary[i][1][s].substr( 43 );
                // do we care about extra args there?
                console.log('Google Tag Manager found, with '+ gtmd );
              }
            }
            //https://www.googletagmanager.com/gtm.js?id=GTM-PGQC7X
            break;
          case 'ga':
            if ( resources_summary[i][1].length == 0 ) {
              console.log('No Google Analytics found?');
            } else {
              for ( var s in resources_summary[i][1] ) {
                if ( DEBUG ) {
                  console.log( resources_summary[i][1][s] );
                }
                // search each for a tid
                var tidat = resources_summary[i][1][s].indexOf('&tid=');
                if ( tidat > 0 ) {
                  var nextt = resources_summary[i][1][s].indexOf('&', tidat + 1);
                  nextt = resources_summary[i][1][s].substr( tidat, nextt - tidat );
                  console.log('Google Analytics found, with '+ nextt.substr(5) );
                }
              }
            }
            break;
          case 'hotjar':
            if ( resources_summary[i][1].length == 0 ) {
              console.log('No Hotjar found?');
            } else {
              for ( var s in resources_summary[i][1] ) {
                if ( DEBUG ) {
                  console.log( resources_summary[i][1][s] );
                }
                if ( resources_summary[i][1][s].substr(0, 35) == 'https://static.hotjar.com/c/hotjar-' ) {
                  var jsat = resources_summary[i][1][s].indexOf('.js');
                  console.log('Hotjar found, with ID = '+ resources_summary[i][1][s].substr( 35, jsat - 35 ) );
                }
              }
            }
            break;
          case 'vwo':
            if ( resources_summary[i][1].length == 0 ) {
              console.log('No Visual Website Optimizer found?');
            } else {
              for ( var s in resources_summary[i][1] ) {
                if ( DEBUG ) {
                  console.log( resources_summary[i][1][s] );
                }
                var jpat = resources_summary[i][1][s].indexOf('j.php');
                if ( jpat > 0 ) {
                  var aat = resources_summary[i][1][s].indexOf('?a=', jpat);
                  if ( aat < 0 ) {
                    aat = resources_summary[i][1][s].indexOf('&a=', jpat);
                  }
                  // then try again
                  if ( aat > 0 ) {
                    aat = resources_summary[i][1][s].substr( aat + 3 );
                    jpat = aat.indexOf('&');
                    if ( jpat > 0 ) {
                      aat = aat.substr(0, jpat);
                    }
                    console.log('Visual Website Optimizer found, with ID = '+ aat );
                  }
                }
              }
            }
            break;
          case 'font':
            console.log( resources_summary[i][1].length +' '+ resources_summary[i][0] +' file'+ ( resources_summary[i][1].length > 1 ? 's' : '' ) );
            if ( DEBUG ) {
              if ( resources_summary[i][1].length > 0 ) {
                for ( var s in resources_summary[i][1] ) {
                  console.log( resources_summary[i][1][s] )
                }
              }
            }
            break;
          default:
            //if ( ! DEBUG ) {
            console.log( resources_summary[i][1].length +' '+ resources_summary[i][0] +' file'+ ( resources_summary[i][1].length > 1 ? 's' : '' ) );
            //}
            break;
        }
      }
    }, BUFFER_TIME );
  }
  firstloaded = true;
  // and then?
}

// now all we have to do is open the page, wait WAIT_TIME ms and exit
try {
  page.open(address, function (status) {
    if (status !== 'success') {
      console.log("FAILED: to load " + system.args[1]);
      console.log(page.reason_url);
      console.log('status = '+ status);
      console.log(page.reason);
      console.log('Perhaps there is some Basic Authentication in place?');
      console.log('You can enter a username and password as additional args after the URL..');
      phantom.exit();
    } else {
      if (address != page.url){
       console.log('Redirected: ' + page.url)
      }

      setTimeout(function () {
        phantom.exit();
      }, WAIT_TIME);
    }
  });
} finally {
  // if we are still running after MAX_EXECUTION_TIME ms exit anyways
  setTimeout(function() {
    console.log("FAILED: Max execution time " + Math.round(MAX_EXECUTION_TIME) + " seconds exceeded");
    phantom.exit(1);
  }, MAX_EXECUTION_TIME);
}
