# MediBloc Blockchain Explorer

MediBloc Explorer works with [go-medibloc](https://github.com/medibloc/go-medibloc). Current version of MediBloc Explorer does not have a server feature.

## Prerequisites

To run MediBloc Explorer following resources are required.

- Node.js v10.13.0 or higher (<https://nodejs.org/>)

- Yarn v1.9.2 (<https://yarnpkg.com/en/docs/install>)

- go-medibloc v0.2 (<https://github.com/medibloc/go-medibloc>) - You need to install all required resources written in [go-medibloc](https://github.com/medibloc/go-medibloc).

  ```
  git clone https://github.com/medibloc/go-medibloc.git
  cd go-medibloc
  make dep
  make build
  build/medi conf/local/single_node/node.conf
  ```

## Installation

- Clone the MediBloc Explorer repository and run.

  ```
  git clone https://github.com/medibloc/explorer.git
  cd explorer
  cd client && npm install
  cd ..
  cd server && npm install
  ```

## Start(Server)

MediBloc Explorer Server uses Mysql as Backend Storage

Install & Configure Mysql

General : https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/

Mac : https://github.com/rajivkanaujia/alphaworks/wiki/Install-MySQL-using-Homebrew

Default database name is "medi_explorer". You can change database name in server/config/default.js. Create this database with mysql command-line.

And then, You must configure ENVIRONMNET VARIABLES with your DB username & password

```
export EXPLORER_DB_USERNAME={username}
export EXPLORER_DB_PASSWORD={password}
```

Then,
`cd server && npm run syncdb && npm start`

## Configuration(Server)

The `server/config/default.js` file contains configuration settings for MediBloc Explorer Server.

#### Blockchain endpoint

To connect with custom MediBloc blockchain, blockchain.url should be set.
```
export default {
  blockchain: {
    url: 'http://localhost:9921',
  },
  ...
```

## Start(Client)

MediBloc Explorer Client is using Webpack.

If you want to watch all the changes of the code in real time, run the following command. It will run the MediBloc Explorer on the port 3000(<http://localhost:3000>).

`yarn start`

To generate the minified files, run the following command.

`yarn build`


## License
```
Copyright 2018 MediBloc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
