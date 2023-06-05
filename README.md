# Nordic Testing Days 2023 Workshop

## Foundations of an Automation Pipeline

### Building a consistent fast feedback loop for your software.

#### Prerequisites:
 - Docker Desktop
 - Jenkins CI
 - Node JS
 - A code editor (recommended VS Code)

 Please fork the repository, run `git checkout workshop`

 First things first, we have ourselves an API service which needs testing, why don't we go ahead and start that up.

 Install the dependencies using `npm install` and then launch the API service with `npm start`.

 The api should now be running at `http://localhost:3000`, if for whatever reason that port is already taken on your machine, you can configure this in the app.js file on line 3.

 To check that this is working correctly, head to `http://localhost:3000/api/movies` in your browser and you should see a JSON list of movie data.

---
The API has four endpoints:
>### GET /api/movies

A get request which returns the full list of movies.*

>### GET /api/movies/title/:title

*A get request returning an exact match for a movie with the passed in title*

:title - A URL Encoded string that matches the title of a movie.

>### GET /api/movies/director/:director

*A get request returning any movies created by the specified director*

:director - A URL Encoded string that matches a Director

>### GET /api/movies/rating/:method/:rating

*A get request that filters the movies based on a specified method and rating.

:method - The method by which movies are filtered by rating
Accepted methods are `[lessThanOrEqual, moreThanOrEqual, equalTo]`*

:rating - An integer rating value between 1 to 10

---
Feel free to play around with this in any request client you like. 

[Postman](https://www.postman.com/downloads/) is available to download here if you need to install one.

N.B remember that all parameters will need to be url encoded to work correctly [URLEncoder](https://www.urlencoder.org/)

When you're comfortable with the API, let's create some tests.

---
## On with the tests

Let's create the test subfolder
`mkdir tests`

And jump on in to there
`cd tests`

We will need to create a new project
`npm init`

Don't worry too much about the details here, for reference I have used 
```
{
  "name": "movie-api-tests",
  "version": "1.0.0",
  "description": "Testing library for the movie-api",
  "entrypoint": "movie-tests.js",
  "test command": "jest", //this one actually is important
  "git repository": "Enter your forked repository here",
  "keywords": empty,
  "author": "Your name here"
  "license": Leave blank for default ISC
}
```

And we will need to install some dependencies:

`npm install jest`

`npm install supertest`

By default Jest picks up our tests from the `__tests__` directory so lets create that too.

`mkdir __tests__` and lets create our first file in here, it should be fine as long as it has .js on the end but lets call it `movie-tests.js`.

`cd __tests__`

then

`touch movie-tests.js`

To make things easier let's also copy the data source direct from the API.

`cd ..` back to the test directory

`mkdir test_data` to create a folder to hold it

`cp ../data/movies.json test_data/movies.json` to copy the test data source.

Now that we have the basic structure in place, let's open up our test folder in our code editor.

---

Within our `tests/__tests__/movie-tests.js` file we can start to implement some tests.

I'll start you off with some boilerplate as the focus of this tutorial isn't necessarily about the test writing.

```
const {expect, describe, test} = require('@jest/globals')
const request = require("supertest")
const movies = require("../test_data/movies.json")

let baseUri = process.env.BASE_URI ?? "http://localhost"
let port = process.env.PORT ?? 3000

let testUri = port ? `${baseUri}:${port}` : baseUri

module.exports = {
	testEnvironment: "node",
}

describe("Movie API endpoint tests", () => {

    test("GET /api/movies", (done) => {
        request(testUri)
            .get('/api/movies')
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBeGreaterThan(1)
                expect(res.body).toEqual(movies)
            })
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    })
})
```

You can add as many additional tests here as you like and we will take some time here to expand this section.

Remember to check them regularly using `npm test`.

Before we move on to the next stage, let's stop the API running using `CTRL + C` in the terminal.

---

## **Introducing Docker**

We will now start to containerise our tests so that they're executed within a consistent environment.

You will want to create a `Dockerfile` in your `tests` directory.

We're lucky that there are many pre-built environments for us to start from that 1000s of developers maintain and upkeep, so rather than starting with a barebones linux installation, let's go ahead and use a pre-built node environment which contains all of our build toolchain and package management for us.

So your first line will be:
`FROM node:19-alpine`

This is our base image, everything we do after this point will be building on top of this environment. This is an official image built by the node maintainers based on version 19 of Node JS and built upon the popular lightweight alpine version of Linux.

Next we need to define our workspace within the container. This would also be the entrypoint directory to the container via any shells.

Our next line is `WORKDIR /usr/src/app`

Next, we need to bring in our package spec from our local machine.

You can do this with `COPY package*.json .` which will copy all package files from your current local directory in to the WORKDIR we established earlier.

We then need to install our dependencies inside the container.

`RUN npm install` will accomplish this, the RUN command allows you to execute shell commands during the building phase of the container.

After we have our packages, we need to bring in the test files and the data that we have locally, we can achieve this with `COPY . .` which will copy over all of our files from the current directory in to the containers' WORKDIR.

Our next command is where our container comes to an end.
For this we will enter `CMD npm test`, so far all of the previous parts of building this file have been building up our environment but the CMD command is different, it can only be defined once and it is what executes when a container is ran. In this case, we want to execute our tests when the container is created.

---

## **Creating our containers**

Now that we have a Dockerfile created, we can build ourselves a container.

Let's go back to our top level directory `cd ..`

You can do this for our `test` directory by executing `docker build test -t <REPOSITORY_HOST>/<USER_ID>/<CONTAINER_NAME>`

Since for this tutorial we will be hosting our containers locally we can skip the <REPOSITORY_HOST> part. So for me I will build the container as `docker build test -t masterman/movie-api-tests`

To break this down `build` takes the Dockerfile at the specified directory `test`, pulls down the base images, executes what we have told it in the Dockerfile then gives the build a tag marker `-t masterman/movie-api-tests` so we have a named identifier for our newly created image.

We can also do this for our API and build the container image for that too.

This time we will execute `docker build . -t <YOUR_USER>/movie-api`. Since the `.` argument specifies the current directory, it will take the Dockerfile at the base of the project.

---

## **Running our containers**

Now that we have our container images built, we're going to want to actually run them.

To run a container you can simply run `docker run <CONTAINER-TAG>` but for our API service we will need to do something extra.

If you open up the Dockerfile in the API folder, you will notice the line `EXPOSE 3000`, this exposes the port 3000 on the container to it's network.

When we run our API, we need to map the port within the container back to the local network, we can do that back to the same port locally as follows:

`docker run -p 3000:3000 -d <YOUR_USER>/movie-api`

This takes the image we created earlier at the tag `<YOUR_USER>/movie-api` and executes what was in the CMD command. The `-p 3000:3000` says I want to map port 3000 in the container to port 3000 locally. Finally `-d` means we want to run it in detached mode, so we are launching the container but don't need to be attached to the process.

If you now go back to Postman or whichever client you were using, you should find you can once again make requests to the movies API.

Now let's try and run our tests container.

`docker run --rm <YOUR_USER>/movie-api-tests`

The `--rm` here means that when the container has finished executing it will remove the container automatically.

You will probably notice that your tests failed. Even though you can connect to your API locally, your container can't, Docker containers reside within their own network inside of the VM.

We need to do a bit more work to make the containers talk to each other.

If you run `docker network list` you should see a network called `bridge` this is created by default and in more advanced use cases you would create your own networks for specific services to communicate with each other. In this case we will use `bridge`.

Next execute `docker network inspect bridge` and you should get some details back in JSON format, look for `IPv4Address` and copy this without the subnet mask `/16`, you will need it soon.

Within Docker desktop, kill any containers which are currently running and let's start things over.

First lets run our API container again, this time with:

`docker run -p 3000:3000 --network bridge -d <YOUR_USER>/movie-api`

This will run the API container on the bridge network.

Now in your test file, if you copied the boiler plate, you may have noticed 2 environment variables PORT and BASE_URI. These will come in to play now.

We can run our test container using:

`docker run -e PORT=3000 -e BASE_URI=<IPV4Address> --network bridge --rm  <YOUR_USER>/movie-api-tests`

The `-e` specifies an environment variable that will be passed in to the container, you will notice that this container is also being created on the `bridge` network. 
Our tests should all execute smoothly now that our containers can talk to each other.

---

## Bring on Jenkins

If you haven't been already, take the opportunity now to commit your work and push it back up to your repository.

We will now be starting with Jenkins. If you have it running at the default location you should find it at `localhost:8080` in your browser.

When you have logged in and you're at the dashboard, hit `+ New Item` give the project a name `My-Awesome-Test-Pipeline` for example, select `Pipeline` and press `OK` to proceed.

Scroll down to the pipeline section and in the definition select `Pipeline script from SCM`, set the `SCM` to `Git`, provide the URL for your forked repository and set the *Branch Specifier* field to `*/workshop`

The script path will remain the same. Hit save then press `Build Now` on the pipeline screen, this pull down your repository and then finish.

We now need to go back to our project and start defining our pipeline.

In the top level directory, create a new file called `Jenkinsfile` and open it up in your code editor window.

Let's create the basic structure.
```
pipeline {
    agent any
    stages {
        stage('My First Stage') {
            steps {
                sh 'echo "Wooh, I've created a pipeline"'
            }
        }
    }
}
```

If you want, you can now commit this, push it to your repository and hit `Build Now` again (You're probably going to be repeating this part a lot).

---

## Lets add something real

Now that we have the basis of a pipeline, lets start to make everything we've done so far repeatable stages.

You can remove the `My First Stage` section now, it won't do any harm if you leave it in either but it is unnecessary.

It is good practice to define different stages of the process individually as when debugging it will help you to understand which part went wrong quicker.

Take some time to define some stages of the process.
For example I have created `Build API container`, `Run API container`, `Build Test container`, `Execute tests` and `Cleanup`. If you want you can look ahead to an already defined pipeline script.

<details>
    <summary> spoiler alert </summary>

```
        stage('Build API container') {
            steps {
                sh 'docker build . -t <YOUR_USER>/movie-api'
            }
        }
        stage ('Run API container') {
            steps {
                sh 'docker run -p 3000:3000 --network bridge --name api-container --rm -d <YOUR_USER>/movie-api'
            }
        }
        stage('Build Test container') {
            steps {
                sh 'docker build tests -t <YOUR_USER>/movie-api-tests'
            }
        }
        stage('Execute tests') {
            steps {
                sh 'docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge --rm <YOUR_USER>/movie-api-tests'
            }
        }
        stage('Cleanup') {
            steps {
                sh 'docker kill api-container'
            }
        }
```

</details>

At this point everything should be running in the pipeline from start to finish, but you may be thinking, what good is all of this. I can't see anything without having to dive in to a console.

---

## Give me the reports!

For the section, we're going to be touching a few areas, the test package, Docker and the Jenkins pipeline script.

### Updating the package.

We're going to need 2 further dependencies in our test package so
move to the test directory `cd tests` and let's install `jest-html-reporter` and `jest-junit`.

`npm install jest-html-reporter`

`npm install jest-junit`

We'll now need to update our package.json to include reporter configuration for jest.

Add the following section to the bottom of your `package.json` file but before the last closing brace `}`

```
  "jest": {
    "reporters": [
      "default",
      [
        "./node_modules/jest-html-reporter",
        {
          "pageTitle": "Test Report",
          "outputPath": "./reports/test-report.html"
        }
      ],
      [
        "jest-junit", {
          "outputDirectory": "reports",
          "outputName": "jest-junit.xml"
        }
      ]
    ]
  }
  ```

These packages will now automatically generate reports from our tests but the tests are still executing in a VM, how do we access the reports?

### Docker Volumes

You have probably by now noticed that as soon as your container is finished executing, it destroys itself, so how do we retrieve anything from it?

This is where a volume comes in to play. A volume is a persistent storage which can be shared between containers and mapped to a certain point in a container's filesystem.

Let's create a volume and call it `test-reports`.

`docker volume create test-reports`

We now need to update our run command for the test container

`docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge -v test-reports:/usr/src/app --rm <YOUR_USER>/movie-api-tests`

The `-v` argument represents a volume, in this case `test-reports` and it has been mapped to `/usr/src/app/` in the container.

To retrieve the content from the volume, we need to use the `docker cp` command, this only works with containers though, not volumes. Lucky for us, this doesn't need to actually be running, so we can create a dummy to retrieve data from.

`docker container create --name report-container -v test-reports:/root alpine`

We can then use the cp command to retrieve the report from our dummy container back to a local path.

`docker cp report-container:/root/reports/. ./reports`

### Update the Jenkins File

Now that we've figured out how to mount a volume, let's go back to our Jenkinsfile and make some changes.

We need to add our volume creation step, update the run command and create a stage to retrieve the reports. We will need to do some additional cleanup after as well.

<details>
    <summary> spoiler alert </summary>

```
        stage('Build API container') {
            steps {
                sh 'docker build . -t masterman/movie-api'
            }
        }
        stage ('Run API container') {
            steps {
                sh 'docker run -p 3000:3000 --network bridge --name api-container --rm -d masterman/movie-api'
            }
        }
        stage('Build Test container') {
            steps {
                sh 'docker build tests -t masterman/movie-api-tests'
            }
        }
        stage('Execute tests') {
            steps {
                sh 'docker volume create test-reports'
                sh 'docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge -v test-reports:/usr/src/app --rm masterman/movie-api-tests'
            }
        }
        stage('Retrieve reports') {
            steps {
                sh 'docker container create --name report-container -v test-reports:/root alpine'
                sh 'docker cp report-container:/root/reports/. ${WORKSPACE}/reports'
            }
        }
        stage('Cleanup') {
            steps {
                sh 'docker kill api-container'
                sh 'docker rm report-container'
                sh 'docker volume rm test-reports'
            }
        }
```

</details>

Finally we will need a couple of extra additions to our Jenkins setup. Return to the Jenkins home page, click `Manage Jenkins`, under the sysyem configuration, head to `Plugins` and under available plugins we will want to download `HTML Publisher plugin` at this stage, you can also download the `Dashboard view` for later.

Return to the `Jenkinsfile` and add a final stage to our pipeline.

``` 
        stage('Publish Test Results') {
            steps {
                junit skipPublishingChecks: true, testResults: 'reports/jest-junit.xml'
                publishHTML target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: false,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'test-report.html',
                    reportName: 'Test Results'
                ]
            }
        }
```

Since Jenkins is built on top of Java, its native test reporting is done in JUnit, so using the junit step we can retrieve our converted jest test results and publish them natively within Jenkins using the step `junit skipPublishingChecks: true, testResults: 'reports/jest-junit.xml'`.

We also produced a HTML test report which we can publish using the `publishHTML` step and see within our Jenkins build page.

Lets run our pipelines again and check that this has all worked as planned.

---

### Adding a Dashboard View

Now that we have our pipeline finished and it is producing test results and reports, it would be nice to have an easy facility to view these, perhaps it could be displayed on a monitor so the team can regularly check the status of the tests.

Head back to the Jenkins homepage and click `My Views`, next to All, you should see a `+` sign, click that and then give your new view a name. Select `Dashboard` as the type and then create your view.

This next section is quite customisable but for our test pipelines, I would suggest adding the `Build Statistics`, `Test Statistics Chart` and `Test Statistics Grid`.

You now have easy visibility over your test executions.