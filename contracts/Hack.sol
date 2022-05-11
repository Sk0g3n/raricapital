//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

import './CEther.sol';

contract Hack {
    CEther cether;

    constructor(address payable _instance) public {
        cether = CEther(_instance);
    }

    function callBorrow() public {
        
    }
}