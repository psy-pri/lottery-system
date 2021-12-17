const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let lottery;
let fetchedAccounts;

beforeEach(async () => {
    fetchedAccounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: "1000000", from: fetchedAccounts[0] });
});

describe("Lottery Contract", () => {
    it("deploys a contract", () => {
        assert.ok(lottery.options.address);
    });

    it("entry of one account in the lottery", async () => {
        await lottery.methods.enter().send({
            from: fetchedAccounts[0],
            value: web3.utils.toWei("0.02", "ether")
        });

        const players = await lottery.methods.getPlayers().call({
            from: fetchedAccounts[0]
        });

        assert.equal(fetchedAccounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it("entry of multiple accounts in the lottery", async () => {
        await lottery.methods.enter().send({
            from: fetchedAccounts[0],
            value: web3.utils.toWei("0.02", "ether")
        });

        await lottery.methods.enter().send({
            from: fetchedAccounts[1],
            value: web3.utils.toWei("0.02", "ether")
        });

        const players = await lottery.methods.getPlayers().call({
            from: fetchedAccounts[0]
        });

        assert.equal(fetchedAccounts[0], players[0]);
        assert.equal(fetchedAccounts[1], players[1]);
        assert.equal(2, players.length);
    });

    it('has entered lottery with enough ether', async () => {
        try{
            await lottery.methods.enter().send({
                from: fetchedAccounts[0],
                value: 10
            });
            assert(false);
        } catch(err){
                assert(err);
        }
    });

    it('only manager can pick winner', async () => {
        try{
            await lottery.methods.pickWinner().send({
                from: fetchedAccounts[2]
            }) 
            assert(false);
        } catch(error){
            assert(error)
        };
    });

    it('sends money to winner and resets the player array', async () => {

        await lottery.methods.enter().send({
            from: fetchedAccounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(fetchedAccounts[0]);
        await lottery.methods.pickWinner().send({from: fetchedAccounts[0]});
        const finalBalance = await web3.eth.getBalance(fetchedAccounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.9','ether'));

        const players = await lottery.methods.getPlayers().call({
            from: fetchedAccounts[0]
        });
        assert.equal(0,players.length);
    });
});
