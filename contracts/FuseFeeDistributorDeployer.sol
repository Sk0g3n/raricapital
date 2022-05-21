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

    function encode(address _comptroller,
                    address _interestRateModel,
                    string memory _name,
                    string memory _symbol,
                    address _implementation,
                    bytes memory _becomeImplementationData,
                    uint256 _reserveFactorMantissa,
                    uint256 _adminFeeMantissa ) public pure returns(bytes memory){
        
        return (abi.encode(_comptroller,
                           _interestRateModel,
                           _name,
                           _symbol,
                           _implementation,
                           _becomeImplementationData,
                           _reserveFactorMantissa,
                           _adminFeeMantissa));
    }

    function decode(bytes memory data) public pure returns(address comptroller,
                                                           address interestRateModel,
                                                           string memory name,
                                                           string memory symbol,
                                                           address implementation,
                                                           bytes memory becomeImplementationData,
                                                           uint256 reserveFactorMantissa,
                                                           uint256 adminFeeMantissa) {
        (comptroller,
        interestRateModel,
        name,
        symbol,
        implementation,
        becomeImplementationData,
        reserveFactorMantissa,
        adminFeeMantissa) = abi.decode(data, (address, address, string, string, address, bytes, uint256, uint256));                                                       

    }

    function editcEtherImplementationWhitelist(address newimplement) public {
        address[] memory oldImplement = new address[](1);
        address[] memory newImplement = new address[](1);
        bool[] memory allowRes = new bool[](1);
        bool[] memory status = new bool[](1);
        oldImplement[0] = 0x0000000000000000000000000000000000000000;
        newImplement[0] = newimplement;
        allowRes[0] = false;
        status[0] = true;
        FuseFeeDistributor(fuseadmin)._editCEtherDelegateWhitelist(oldImplement, newImplement, allowRes, status);
    }

   /* function setPriceOracle(address _comptrolleraddress, address _priceoracle) public {
        bytes memory data = abi.encodeWithSignature('_setPriceOracle(PriceOracle)', _priceoracle);
        _comptrolleraddress.delegatecall(data);
    }
    */
}