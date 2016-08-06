# phantomjs-resource-check
A starting point for loading a URL with PhantomJS and looking at the resources there in the command line terminal, originally based off https://www.distilled.net/resources/using-phantomjs-to-monitor-google-analytics/

## Getting Started
As of right now, the only known dependency is [phantomjs](http://phantomjs.org/) itself.

Once you have that installed on your localhost, or wherever this is going, and added to the system path, then you can just download the [resource_check.js](https://raw.githubusercontent.com/chousmith/phantomjs-resource-check/master/resource_check.js)

## Running resource_check.js
`phantomjs resource_check.js https://github.com`

Passing a URL as the 2nd argument (counting _resource_check.js_ as the first) will run that URL through the phantomjs-resource-check.

Note: at this time, if you do not start the URL with `http://` or `https://` then the script will assume you are trying to load a local URL, and will attempt to do so.

### Basic Authentication

In addition, if the URL you are trying to check is behind Basic Authentication, you can simply provide the auth username and password as additional arguments :

`phantomjs resource_check.js http://domain.com/password-protected/ myusername mypassword`

### Writing Output to a File

Like most (all?) other shell scripts, you can pipe the output of resource_check.js in to a file :

```
phantomjs resource_check.js https://github.com/chousmith/phantomjs-resource-check/ >> oot.txt;
vi oot.txt
```
