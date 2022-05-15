// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.12;

import './FuseFeeDistributor.sol';

contract FuseAdminDeployer {
    address public fuseadmin;

    event fuseAdminDeployed(address admin);
    function deployFuseAdmin() public {
        FuseFeeDistributor fusefeedistributor = new FuseFeeDistributor();
        fuseadmin = address(fusefeedistributor);

        emit fuseAdminDeployed(address(fuseadmin));
    }

    function initializeFeeDistributorAndAdmin(uint256 _fees) public {
        (bool result, ) = fuseadmin.call(abi.encodeWithSignature('initialize(uint256)', _fees));
        require(result, 'initialization failed');
    }
}