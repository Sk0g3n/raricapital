//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import './CEther.sol';
import './Comptroller.sol';

contract Hack {
    address comptroller;
    address cether;
    constructor(address _comptroller, address _cether) public {
        comptroller = _comptroller;
        cether = _cether;
    }
    function enterMarket() public {
        address[] memory markets = new address[](1);
        markets[0] = cether;

        Comptroller(comptroller).enterMarkets(markets);
    }

    function callMint(address payable _cether) public {
        //CEther(_cether).mint.value(10 ether);
        (bool success, )= _cether.call.value(10 ether)(abi.encodeWithSignature('mint()'));
        require(success, 'mint failed');
    }

    function getCEthBalance() public view returns(uint256){
        address payable _cether = address(uint160(cether));
        return CEther(_cether).balanceOf(address(this));
    }   

    function() external payable{}
}