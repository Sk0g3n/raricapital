//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import './CEther.sol';
import './Comptroller.sol';
import 'hardhat/console.sol';

contract Hack {
    address comptroller;
    address cether;
    address payable _cether;
    constructor(address _comptroller, address __cether) public {
        comptroller = _comptroller;
        cether = __cether;
        _cether = address(uint160(cether));
    }
    function enterMarket() public {
        address[] memory markets = new address[](1);
        markets[0] = cether;

        Comptroller(comptroller).enterMarkets(markets);
    }

    function callMint() public {
        //CEther(_cether).mint.value(10 ether);
        (bool success, )= _cether.call.value(10 ether)(abi.encodeWithSignature('mint()'));
        require(success, 'mint failed');
    }

    function getCEthBalance() public view returns(uint256){
        return CEther(_cether).balanceOf(address(this));
    }

    function callBorrow() public {
        CEther(_cether).borrow(1 ether);
    }

    function checkAllMarkets() public returns(address){

    }   

    function() external payable{}
}