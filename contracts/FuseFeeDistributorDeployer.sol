// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.12;

import './FuseFeeDistributor.sol';

contract FuseAdminDeployer {
    address payable public fuseadmin;


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

    function editComptrollerImplementationWhitelist(address _newimplement) public {
        address[] memory oldImplement = new address[](1);
        address[] memory newImplement = new address[](1);
        bool[] memory status = new bool[](1);
        oldImplement[0] = 0x0000000000000000000000000000000000000000;
        newImplement[0] = _newimplement;
        status[0] = true;

        FuseFeeDistributor(fuseadmin)._editComptrollerImplementationWhitelist(oldImplement, newImplement, status);
    }
}