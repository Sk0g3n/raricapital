// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.12;

import './FuseFeeDistributor.sol';

contract FuseAdminDeployer {
    function deployFuseAdmin() public returns(address){
        return address(new FuseFeeDistributor());
    }
}