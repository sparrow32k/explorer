import axios from 'axios';
import BigNumber from 'bignumber.js';

import config from '../../config';
import db from '../db';

import AccountLog from '../accountLog/model';
import Account from '../account/model';
import Block from '../block/model';
import Transaction from '../transaction/model';

const { url } = config.blockchain;

export const parseBlock = block => ({
  data: block,
  height: +block.height,
  id: +block.height,
});

const parseTx = (block, tx) => ({
  blockId: block.id,
  data: tx,
  txHash: tx.hash,
});

export const accountUpdater = (t) => {
  const accountMap = {};
  const getAccount = (address) => {
    if (accountMap[address]) {
      return Promise.resolve(accountMap[address]);
    }
    return Account.findOrCreate({ transaction: t, where: { address } })
      .then(([account]) => {
        accountMap[address] = account;
        return account;
      });
  };
  const handleTx = async (dbTx) => {
    const { data: { from, to, value: valueStr } } = dbTx;

    const value = new BigNumber(valueStr);
    const fromAccount = await getAccount(from);
    const toAccount = await getAccount(to);
    const fromLog = {
      accountId: fromAccount.id,
      data: { balance: `-${value}` },
      transactionId: dbTx.id,
    };
    const toLog = {
      accountId: toAccount.id,
      data: { balance: `+${value}` },
      transactionId: dbTx.id,
    };
    return Promise.all([
      fromAccount.update({
        balance: new BigNumber(fromAccount.balance).minus(value).toString(),
      }, { transaction: t }),
      AccountLog.create(fromLog, { transaction: t }),
      toAccount.update({
        balance: new BigNumber(toAccount.balance).plus(value).toString(),
      }, { transaction: t }),
      AccountLog.create(toLog, { transaction: t }),
    ]);
  };
  const updateAccountsData = height => Promise.all(
    Object.values(accountMap).map(dbAccount => axios({
      params: { address: dbAccount.address, height },
      url: `${url}/v1/account`,
    }).then(({ data }) => dbAccount
      .update({ data }, { where: { id: dbAccount.id }, transaction: t }))),
  );

  return { handleTx, updateAccountsData };
};

export const handleBlockResponse = (blocks, handleTx, t) => Block
  .bulkCreate(blocks.map(parseBlock), { transaction: t })
  .then((res) => {
    console.log(`blocks from ${res[0].height} to ${res[res.length - 1].height} added`); // eslint-disable-line no-console
    let txs = [];
    const blockMap = blocks.reduce((obj, b) => {
      obj[+b.height] = b; // eslint-disable-line no-param-reassign
      return obj;
    }, {});
    res.forEach((block) => {
      const { transactions = [] } = blockMap[block.height];
      txs = txs.concat(transactions.map(tx => parseTx(block, tx)));
    });

    const txCount = txs.length;
    if (txCount) {
      console.log(`add ${txCount} transactions`); // eslint-disable-line no-console
      return Transaction
        .bulkCreate(txs, { transaction: t })
        .then(dbTxs => dbTxs
          .reduce((promise, dbTx) => promise.then(() => handleTx(dbTx)), Promise.resolve()));
    }
    return Promise.resolve(res);
  });

const topics = {
  // EXECUTED_TX: 'chain.transactionResult',
  'chain.newTailBlock': {
    onEvent: ({ hash, topic }) => axios({
      method: 'get',
      url: `${url}/v1/block?hash=${hash}`,
    }).then(({ data: block }) => db.transaction((t) => {
      const { handleTx, updateAccountsData } = accountUpdater(t);
      return handleBlockResponse([block], handleTx, t)
        .then(([dbBlock]) => {
          updateAccountsData(block.height);
          return dbBlock;
        });
    }))
      .then(block => pushEvent({ data: block.dataValues, topic })), // eslint-disable-line no-use-before-define, max-len
  },
};

const clients = Object.keys(topics).reduce((obj, key) => {
  obj[key] = []; // eslint-disable-line no-param-reassign
  return obj;
}, {});

export const onSubscribe = (client, options) => {
  const { topics: reqTopics } = options;
  (reqTopics || []).forEach((topic) => {
    clients[topic].push(client);
  });
};

export const pushEvent = (e) => {
  const { topic } = e;
  if (!clients[topic]) {
    throw new Error(`invalid topic ${topic}`);
  }
  clients[topic].forEach((client) => {
    client.sseSend(e);
  });
};

export const startSubscribe = () => {
  axios({
    data: {
      topics: Object.keys(topics),
    },
    method: 'post',
    responseType: 'stream',
    url: `${url}/v1/subscribe`,
  }).then(({ data }) => {
    data.on('data', (buf) => {
      const { result } = JSON.parse(buf.toString());
      const { topic } = result;
      if (!topics[topic]) {
        console.log(`topic ${topic} does not exist`); // eslint-disable-line no-console
        return;
      }
      console.log(`event ${topic} received`); // eslint-disable-line no-console
      topics[topic].onEvent(result);
    });
  });
};
