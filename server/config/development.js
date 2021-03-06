import path from 'path';

const endpoint = 'localhost';
const config = {
  BLOCKCHAIN: {
    URL: 'http://localhost:9921',
    TENDERMINT_URL: {
      http: `http://${endpoint}:26657`,
      ws: `ws://${endpoint}:26657/websocket`,
    },
    SERVER_URL: {
      http: `http://lcd.imperium-0000.firmachain.org`,
      local: `http://localhost:4000/api/v1`,
    },
    COINMARKETCAP_URL: 'https://api.coinmarketcap.com/v2/ticker/4953/',
    COINGEKCO_URL: 'https://api.coingecko.com/api/v3/simple/price?ids=firmachain&vs_currencies=usd',
    GENESIS_ACCOUNT: 'firma1ytleandjvn27kcpsfly3d39amw6n2znfpm5eg7',
    TOPICS: {
      newTailBlock: {},
    },
    MEM_FIELDS: {
      notBondedTokens: null,
      bondedTokens: null,
      totalSupply: null,
      price: null,
    },
  },
  DB: {
    database: 'explorer',
    dialect: 'mysql',
    host: '127.0.0.1',
  },
  REQUEST: {
    REQUEST_STEP: 10,
  },
  SERVER: {
    PORT: 4000,
    SECRET: null,
    PASSWORD_HASH: null,
    HASH_ALG: 'sha256',
  },
  LOGGER: {
    DIR: path.join(__dirname, '../logs'),
  },
};

export default config;
