# MBTA Ninja
MBTA Ninja is a crowdsourced alerting system for public transit in Boston.

View the site: [mbta.ninja](http://mbta.ninja)
Follow us on Twitter: [@mbta_ninja](https://twitter.com/mbta_ninja)

The project started as a weekend hack by [David Lago](https://twitter.com/dave_lago), [Geoffrey Litt](https://twitter.com/geoffreylitt), and [Radhika Malik](https://twitter.com/radhikam24) for [CodeAcross Boston 2015](http://www.eventbrite.com/e/codeacross-boston-2015-tickets-15442437747).
The site is built using Meteor.js and Materialize.css, and deployed on Heroku.

## Contributing

We welcome contributions that would make this tool more useful for the Boston community -- whether it's adding support for more MBTA lines, or entire new features.

Please create a GitHub issue if you have an idea. And if you're able to code a solution and open a pull request, even better!

Our roadmap is available on [Waffle](https://waffle.io/codeforboston/mbta-ninja).

## Deployment

MBTA Ninja is deployed on [Heroku](http://heroku.com). Below is a quick guide to getting it up and running so you don't have to suffer too much to get it set up.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Prerequisite:  

- If you dont have a heroku account, make one before you start.

- Install Meteor.js  

```
curl https://install.meteor.com/ | sh
```
- Install [Heroku Toolbelt](https://toolbelt.heroku.com/) so you will have the heroku command line tool.  

### Make a heroku app

In order to get up and running on Heroku, you first have to make a heroku app. We'll clone this repo as the example which you can modify.

First, you have to login:
```
	heroku login
```
Then, clone this repo and enter that folder:

	git clone https://github.com/codeforboston/mbta-ninja.git
	cd mbta-ninja

Next, make the heroku app:

	heroku create <app_name>

app_name is optional and can be whatever you want it to be. A crazy name you can change later will be created if you choose not to supply a name.

### Set the buildpack

Heroku uses framework-specific buildpacks in order to know how to run your app.

To deploy this repo as a heroku app, you'll need to specify that it should be run using the custom meteor.js buildpack. To do this, all you need to run is:

	heroku buildpacks:set https://github.com/jordansissel/heroku-buildpack-meteor.git

You should be good to go!

### Add a MongoLab Extension

You'll need a database to handle the reports of incidents as well as the related up and down votes. This is all set up in the code, though you'll need to make an instance of a MongoLab DB in order to handle the data for this specific instance.

To do this, run:

	heroku addons:create mongolab:sandbox

Heroku will ask you to enter a credit card if you haven't already. You'll need to do this even though the sandbox version is free and you won't be charged.

Go to the heroku dashboard for your app and find the *Settings* tab. Click on *reveal config vars*. There should have been one made for MONGOLAB_URI. Make another one with the key MONGO_URL using the same value.

### Push to the repo

Once you are ready to deploy, run the following

	git add -A
	git commit -m "first commit"
	git push heroku master

Building meteor.js may take a while.

Make sure at least one instance is running:

	heroku ps:scale web=1

Once you are done, your app should be ready at app_name.herokuapp.com! You can quickly open it by running:

	heroku open

If your build is successful, but you get the Application Error page that says  
```
An error occurred in the application and your page could not be served. Please try again in a few moments.

If you are the application owner, check your logs for details.
```
It can be that by default Heroku opens the app from `https://`. If you open the URL from `http://` it will work fine. To change the settings, you need to add ROOT_URL to the Config Variables in your app settings; the value is `http://YOUR-APP-NAME.herokuapp.com`.  

If you still see the error message above when trying to access your heroku site, check the logs by running:

    heroku logs

See if you find the following chunk:
```
2015-10-27T07:12:02.635321+00:00 heroku[web.1]: Starting process with command `node build/bundle/main.js`
2015-10-27T07:12:05.973980+00:00 app[web.1]:
2015-10-27T07:12:05.974084+00:00 app[web.1]: /app/build/bundle/programs/server/node_modules/fibers/future.js:245
2015-10-27T07:12:05.974491+00:00 app[web.1]: 						      ^
2015-10-27T07:12:05.974489+00:00 app[web.1]: 						throw(ex);
2015-10-27T07:12:06.060729+00:00 app[web.1]: Error: MONGO_URL must be set in environment
2015-10-27T07:12:06.060733+00:00 app[web.1]:     at Object.<anonymous> (packages/mongo/remote_collection_driver.js:36:1)
2015-10-27T07:12:06.060734+00:00 app[web.1]:     at Object.defaultRemoteCollectionDriver (packages/underscore/underscore.js:750:1)
2015-10-27T07:12:06.060735+00:00 app[web.1]:     at new Mongo.Collection (packages/mongo/collection.js:98:1)
2015-10-27T07:12:06.060736+00:00 app[web.1]:     at app/lib/report.js:1:46
2015-10-27T07:12:06.060736+00:00 app[web.1]:     at app/lib/report.js:121:3
2015-10-27T07:12:06.060737+00:00 app[web.1]:     at /app/build/bundle/programs/server/boot.js:222:10
2015-10-27T07:12:06.060738+00:00 app[web.1]:     at Array.forEach (native)
2015-10-27T07:12:06.060739+00:00 app[web.1]:     at Function._.each._.forEach (/app/build/bundle/programs/server/node_modules/underscore/underscore.js:79:11)
2015-10-27T07:12:06.060740+00:00 app[web.1]:     at /app/build/bundle/programs/server/boot.js:117:5
2015-10-27T07:12:06.939374+00:00 heroku[web.1]: State changed from starting to crashed
2015-10-27T07:12:06.925353+00:00 heroku[web.1]: Process exited with status 8
```
If so, you need to set a MONGO_URL config variable on your app. You should already have a MONGOLAB_URI variable associated with your app from the addon, you can check with

    heroku config

We're going to set the MONGO_URL value to the same as MONGOLAB_URI. There are two ways to do this:  

1. Copy the MONGOLAB_URI value from `heroku config` and run

    heroku config:set MONGO_URL=<MONGOLAB_URI Value>

2. Go to the heroku dashboard and add MONGO_URL to the Config Variables in Settings. To see these you'll need to click a button labeled `Reveal Config Vars`

Once saved, wait a second for the change to propogate and then check your heroku app's URL. You should be good to go!

# License

MBTA Ninja is released under the [MIT License](http://www.opensource.org/licenses/MIT)
