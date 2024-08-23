<div align="center" id="top"> 
  <img src="https://avatars.githubusercontent.com/u/169302941?s=80" alt="Kyuddle Avatar" draggable="false" />
</div>

<div align="center">
  <h1>
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/Kyuddle/VRCScraperUserData?label=VRC Scraper User Data&color=white" width="400" draggable="false" />
  </h1>
</div>

<p align="center">
  <a href="https://github.com/search?q=repo%3AKyuddle%2FVRCScraperUserData+owner%3Akyuddle+NOT+path%3A%2F%5E%5C.github%5C%2F%2F+NOT+path%3A%2F%5E%5Cdist%5C%2F%2F+NOT+language%3A%22JSON+with+Comments%22+NOT+language%3AText+NOT+language%3A%22Git+Attributes%22+NOT+language%3AMarkdown&type=code" title="See the Used Language in Src" rel="noopener" target="_blank">
    <img alt="Github top language" src="https://img.shields.io/github/languages/top/Kyuddle/VRCScraperUserData?color=white" draggable="false" />
  </a>
  <span>
    <img alt="Repository size" src="https://img.shields.io/github/repo-size/Kyuddle/VRCScraperUserData?color=white" draggable="false" />
  </span>
  <a href="https://github.com/Kyuddle/VRCScraperUserData/graphs/contributors" title="See the contributors" rel="noopener" target="_blank">
    <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/Kyuddle/VRCScraperUserData?color=white">
  </a>
  <br />
  <a href="https://github.com/Kyuddle/VRCScraperUserData/graphs/commit-activity" title="See the Commit Activity" rel="noopener" target="_blank">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/Kyuddle/VRCScraperUserData?color=white" draggable="false" />
  </a>
  <a href="https://github.com/Kyuddle/VRCScraperUserData/graphs/traffic" title="See the Graphs Traffic" rel="noopener" target="_blank">
    <img alt="GitHub viewer counter" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fhits.dwyl.com%2FKyudle%2FVRCScraperUserData.json&color=white" />
  </a>
</p>

<h4 align="center">
	🚧 VRCSUD 🚀 is Under construction... 🚧
</h4>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/Kyuddle" target="_blank">Author</a>
</p>

<br>

## :dart: About

The project has been created in order to be able to quickly and efficiently obtain data relating to my own VRChat account, such as the list of my groups, my represented group, all my worlds, my bio, my avatar, etc...

And then put it all on a lightweight web server so I could have an API with a cache that would be quicker and easier to use and fetch in applications.

## :sparkles: Features

:heavy_check_mark: Login to VRChat with Puppeteer
:heavy_check_mark: Get the data with Puppeteer

## :rocket: Technologies

- [Concurrently](https://www.npmjs.com/package/concurrently)
- [Express](https://expressjs.com)
- [Puppeteer](https://pptr.dev)
- [NodeJS](https://nodejs.org) (ReadLine, FS, Path)
- [TypeScript](https://www.typescriptlang.org)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com) and [Node](https://nodejs.org/en/) installed.

Also create an .env file with the data entered in the template below:

```js
NICKNAME = YourUsernameUsedInTheCreation;
PASSWORD = IfYouNeedToNotRefillAllTimeIsOptional;
USER_ID = usr_YOURIDVRCHAT;
PORT = IfYouWantToChangeTheDefaultWebAPIPort;
```

## :checkered_flag: Starting

```bash
# Clone this project
$ git clone https://github.com/Kyuddle/VRCScraperUserData

# Access
$ cd VRCScraperUserData

# Install dependencies
$ npm i

# Run the project
$ npm run start

# The web API will initialize in the <http://localhost:3000> by default
# The scraper will log in your console
```

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE) file. <br>
Made with :heart: by <a href="https://github.com/Kyuddle" target="_blank">Kyuddle</a>

&#xa0;

<a href="#top">Back to top</a>
