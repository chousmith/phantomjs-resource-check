# phantomjs-resource-check
A starting point for loading a URL with PhantomJS and looking at the resources there in the command line terminal, originally based off https://www.distilled.net/resources/using-phantomjs-to-monitor-google-analytics/

## Getting Started
As of right now, the only known dependency is [phantomjs](http://phantomjs.org/) itself?

Once you have that installed on your localhost, or wherever this is going, and added to the system path, then you can just download the [resource_check.js](https://raw.githubusercontent.com/chousmith/phantomjs-resource-check/master/resource_check.js)

## Running resource_check.js
`phantomjs resource_check.js http://www.ninthlink.com/`

Passing a URL as the 2nd argument (counting _resource_check.js_ as the first) will run that URL through the phantomjs-resource-check.

Note: at this time, if you do not start the URL with `http://` or `https://` then the script will assume you are trying to load a local URL, and will attempt to do so.

### Default Output
```
$ phantomjs resource_check.js http://www.ninthlink.com/
Page loaded in 4.284 seconds with Status = success
--------------------------------------------------
No Google Tag Manager found?
Google Analytics found, with UA-#######-#
No Hotjar tracking script found?
No Visual Website Optimizer tracking script found?
No Facebook tracking script found?
13 css files
22 js files
11 img files
```

### Note on Page Load Time Reporting
The resource_check.js outputs a message about "Page loaded in ... seconds...". Currently this is done by noting the time at the start of the script initialization, loading the file, and then reporting back after the first `page.onLoadFinished` event. This seems to be arbitrary and may not reflect the absolute correct time until DOM is ready, or until initial pixel is visible, or anything. In other words, this is currently an approximation.

### Writing Output to a File
Like most (all?) other shell scripts, you can pipe the output of resource_check.js in to a file :

```
phantomjs resource_check.js https://github.com/chousmith/phantomjs-resource-check/ >> tmp/oot.txt;
vi tmp/oot.txt
```

The `tmp` folder is already in the [.gitignore](https://github.com/chousmith/phantomjs-resource-check/blob/master/.gitignore)

### Basic Authentication
In addition, if the URL you are trying to check is behind Basic Authentication, you can simply provide the auth username and password as additional arguments :

`phantomjs resource_check.js http://domain.com/password-protected/ myusername mypassword`

### DEBUG mode
There is a `var DEBUG = false;` set in the resource_check.js. Setting to `true` will output much more information, which may or may not actually be helpful.

Currently the only way to change that is to edit [resource_check.js](https://github.com/chousmith/phantomjs-resource-check/blob/master/resource_check.js#L17) itself.

