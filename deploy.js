const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    //remember to change to your own phrase
    'ENTER_YOUR_ACCOUNT_MNEMONIC',
    //remember to change this to your own rinkeby endpoint
    'ENTER_YOUR_RINKEBY_ENDPOINT'
);

const web3 = new Web3(provider);

const deploy = async () => {
    //get list of fetched accounts
    const fetchedAccounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', fetchedAccounts[0]);

    //deploy smart contract
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '100000', from: accounts[0]});

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};
deploy();