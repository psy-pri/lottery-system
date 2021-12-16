pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint){
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public{
        require(msg.sender == manager);
        uint index = random() % players.length;
        players[index].transfer(this.balance); //first access address of player at index then transfer all the ether for 'this' player
        players = new address[](0); //create new dynamic array to clear players and restart array
    }

    modifier restricted(){
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns(address[]) {
        return players;
    }
}