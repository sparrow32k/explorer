import BigNumber from 'bignumber.js';

export const blockConverter = (data) => {
  try {
    return ({
      height: +data.block.header.height,
      timestamp: data.block.header.time,
      hash: data.block_meta ? data.block_meta.block_id.hash : null,
      prevHash: data.block.header.last_block_id.hash,
      txs: data.block.data.txs || [],
      validator: data.block.header.proposer_address,
    });
  } catch (e) {
    return ({});
  }
};

export const txConverter = (data) => {
  try {
    return data.tx.value.msg.map((m, i) => {
      let fromAccount = null;
      let toAccount = null;

      switch (m.type) {
        case 'cosmos-sdk/MsgBeginRedelegate':
        case 'cosmos-sdk/MsgUndelegate':
        case 'cosmos-sdk/MsgDelegate':
        case 'cosmos-sdk/MsgCreateValidator':
          fromAccount = m.value.delegator_address;
          break;
        case 'cosmos-sdk/MsgSend':
          fromAccount = m.value.from_address;
          toAccount = m.value.to_address;
          break;
        case 'record/SetRecord':
          fromAccount = m.value.Writer;
          break;
        default:
          break;
      }

      return ({
        blockHeight: +data.height,
        executed: data.logs[0].success,
        fromAccount,
        toAccount,
        onChain: true,
        txHash: `${data.txhash}:${i}`,
      });
    });
  } catch (e) {
    return ({});
  }
};

export const balanceConverter = (data) => {
  try {
    return data[0].amount;
  } catch (e) {
    return null;
  }
};

export const stakingConverter = (data) => {
  try {
    return data.reduce((acc, d) => acc.plus(new BigNumber(d.shares)), new BigNumber('0'));
  } catch (e) {
    return null;
  }
};