/**
 * @param {decimal128} amount - in decimal
 * @param {String} username
 * @param {String} purpose
 * @param {String} reference
 * @param {String} summary
 * @param {String} trnxSummary
 * @returns {object} custom response
*/

// utils/transactions.js for updating the transactions recorded
// 2 methods are expensesAccount which will debit the sender and incomeAccount which will credit the received.

const Wallets = require('../models/wallets');
const Transaction = require('../models/Transaction');

const incomeAccount = async ({amount, username, purpose, reference, summary, trnxSummary, session}) => {
  const wallet = await Wallets.findOne({username});
  if (!wallet) {
    return {
      status: false,
      statusCode:404,
      message: `User ${username} doesn\'t exist`
    }
  };

  const updatedWallet = await Wallets.findOneAndUpdate({username}, { $inc: { balance: amount } }, {session});

  const transaction = await Transactions.create([{
    trnxType: 'IC',
    purpose,
    amount,
    username,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) + Number(amount),
    summary,
    trnxSummary
  }], {session});

  console.log(`Income successful`)
  return {
    status: true,
    statusCode:201,
    message: 'Income successful',
    data: {updatedWallet, transaction}
  }
}

const expensesAccount = async ({amount, username, purpose, reference, summary, trnxSummary, session}) => {
  const wallet = await Wallets.findOne({username});
  if (!wallet) {
    return {
      status: false,
      statusCode:404,
      message: `User ${username} doesn\'t exist`
    }
  };

  if (Number(wallet.balance) < amount) {
    return {
      status: false,
      statusCode:400,
      message: `User ${username} has insufficient balance`
    }
  }

  const updatedWallet = await Wallets.findOneAndUpdate({username}, { $inc: { balance: -amount } }, {session});
  const transaction = await Transactions.create([{
    trnxType: 'EXP',
    purpose,
    amount,
    username,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) - Number(amount),
    summary,
    trnxSummary
  }], {session});

  console.log(`Expense successful`);
  return {
    status: true,
    statusCode:201,
    message: 'Expense successful',
    data: {updatedWallet, transaction}
  }
}

module.exports = {
    incomeAccount, expensesAccount
};
