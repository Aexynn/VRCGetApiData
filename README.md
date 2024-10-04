<div align="center" id="top"> 
  <img src="https://avatars.githubusercontent.com/u/169302941?s=80" alt="Aexynn Github Avatar" draggable="false" />
</div>

<div align="center">
  <h1>
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/Aexynn/VRCGetApiData?label=VRC Get Api Data&color=white" width="400" draggable="false" />
  </h1>
</div>

<p align="center">
  <a href="https://github.com/search?q=repo%3AAexynn%2FVRCGetApiData+owner%3ASinoryn+NOT+path%3A%2F%5E%5C.github%5C%2F%2F+NOT+path%3A%2F%5E%5Cdist%5C%2F%2F+NOT+language%3A%22JSON+with+Comments%22+NOT+language%3AText+NOT+language%3A%22Git+Attributes%22+NOT+language%3AMarkdown&type=code" title="See the Used Language in Src" rel="noopener" target="_blank">
    <img alt="Github top language" src="https://img.shields.io/github/languages/top/Aexynn/VRCGetApiData?color=white" draggable="false" />
  </a>
  <span>
    <img alt="Repository size" src="https://img.shields.io/github/repo-size/Aexynn/VRCGetApiData?color=white" draggable="false" />
  </span>
  <a href="https://github.com/Aexynn/VRCGetApiData/graphs/contributors" title="See the contributors" rel="noopener" target="_blank">
    <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/Aexynn/VRCGetApiData?color=white">
  </a>
  <br />
  <a href="https://github.com/Aexynn/VRCGetApiData/graphs/commit-activity" title="See the Commit Activity" rel="noopener" target="_blank">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/Aexynn/VRCGetApiData?color=white" draggable="false" />
  </a>
  <a href="https://github.com/Aexynn/VRCGetApiData/graphs/traffic" title="See the Graphs Traffic" rel="noopener" target="_blank">
    <img alt="GitHub viewer counter" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fhits.dwyl.com%2FAexynn%2FVRCGetApiData.json&color=white" />
  </a>
</p>

<h4 align="center">
	🚧 VRCGAD 🚀 is Under construction... 🚧
</h4>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/Aexynn" target="_blank">Author</a>
</p>

<br>

## :dart: About

The project has been created in order to be able to quickly and efficiently obtain data relating to my own VRChat account, such as the list of my groups, my represented group, all my worlds, my bio, my avatar, all members of my specific group, all bans of my specific group, all infos of my specific group etc...

And then put it all on a lightweight web server so I could have an API with a cache that would be quicker and easier to use and fetch in applications.

## :sparkles: Features

:heavy_check_mark: **Login to VRChat with Puppeteer**  
Automate the VRChat login process using Puppeteer, including management of 2FA authentication. The process involves encoding the credentials in Base64, interacting with the login form and saving the authentication details so that the API can be used later via fetches without the need for continuous reconnection.

:heavy_check_mark: **Retrieve User Data via API**  
Exposes an API endpoint for retrieving user data from scrape-generated JSON files & local backup of retrieved JSON by making requests to the official API. JSON data is read and returned as a response, with appropriate error handling for file access and parsing. All this is done with the aim of providing simpler access to data without exposing any compromising elements for your account or application.

:heavy_check_mark: **Prompt for User Input**  
Utility function for prompting users to enter data via the command line. This function waits for user input and returns it as a string, which is useful for interactive scripts requiring identification or other information. As in the case of not wanting to put your password in the .env but entering it manually each time auth is initiated.

:heavy_check_mark: **Save Authentication Details**  
Store encrypted login credentials, cookies and local storage data in JSON files for later use (for requests to the official API). The process includes creating the necessary directories and managing various authentication data, as well as modifying and creating JSONs for the custom API endpoint. Of course, all data remains on your own system.

:heavy_check_mark: **Handle Errors Gracefully**  
Implement comprehensive error handling for file reading and JSON parsing. Proper responses and logging are in place to manage scenarios where files are missing or data is malformed.

## :rocket: Technologies

- [TypeScript](https://www.typescriptlang.org)
- [JavaScript](https://developer.mozilla.org/docs/Web/JavaScript) (After compilation)
- [Concurrently](https://www.npmjs.com/package/concurrently)
- [Express](https://expressjs.com)
- [Puppeteer](https://pptr.dev)
- [NodeJS](https://nodejs.org) (ReadLine, FS, Path)
- [Axios](https://axios-http.com)
- [js-base64](https://www.npmjs.com/package/js-base64)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com) and [Node](https://nodejs.org/en/) installed.

Also create an .env file with the data entered in the template below:

```js
NICKNAME=YourUsernameUsedInTheCreation;
PASSWORD=IfYouNeedToNotRefillAllTimeIsOptional;
USER_ID=usr_YOURIDVRCHAT;
GROUP_ID=grp_YOURGROUPID;
USER_AGENT=EXAMPLE (https://github.com/Sinoryn/VRCGetApiData)
PORT=IfYouWantToChangeTheDefaultWebAPIPort;
```

## :checkered_flag: Starting

```bash
# Clone this project
$ git clone https://github.com/Aexy nous/VRCGetApiData

# Access
$ cd VRCGetApiData

# Install dependencies
$ npm i

# Run the project
$ npm run start

# The web API will initialize in the <http://localhost:3000> by default
# The scraper will log in your console
```

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE) file. <br>
Made with :heart: by <a href="https://github.com/Sinoryn" target="_blank">Sinoryn</a>

&#xa0;

<a href="#top">Back to top</a>
