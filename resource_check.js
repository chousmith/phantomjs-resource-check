// initialise various variables
var page = require('webpage').create(),
    system = require('system'),
    address;

// how long should we wait for the page to load before we exit
// in ms
var WAIT_TIME = 5000;

// if the page hasn't loaded after this long, something is probably wrong.
// in ms
var MAX_EXECUTION_TIME = 15000;

// output error messages
var DEBUG = false

// a list of regular expressions of resources (urls) to log when we load them
var resources_to_log = [
    new RegExp('^http(s)?://(www|ssl)\.google-analytics\.com.*'),
    new RegExp('^http(s)?://stats\.g\.doubleclick\.net.*')
];

// check we have a url, if not exit
if (system.args.length === 1) {
    console.log('Usage: get_ga_resources.js http://www.yoururl.com');
    phantom.exit(1);
} else {
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
        console.log('Request (#' + requestData.id + '): ' + requestData.url);

        // loop round all our regexs to see if this url matches any of them
        var length = resources_to_log.length;
        while(length--) {
            if (resources_to_log[length].test(requestData.url)){
                // we have a match, log it
                console.log('###');
                console.log('Found a resources_to_log match :');
                console.log(requestData.url);
                console.log('###');
            }
        }
    };

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
        // if we are still running after MAX_EXECUTION_TIME ms exit
        setTimeout(function() {
            console.log("FAILED: Max execution time " + Math.round(MAX_EXECUTION_TIME) + " seconds exceeded");
            phantom.exit(1);
        }, MAX_EXECUTION_TIME);
    }
}
