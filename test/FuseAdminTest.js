const { web3 } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');

describe('FuseFeeDistributorDeployer', () => {
    let accounts, Admin;

    before(async() => {
        accounts = await web3.eth.getAccounts();
        Admin = accounts[0];
    })

    describe('Testing deployment and initialization', () => {
        it('should deploy FuseAdminDeployer', async() => {
            deployer = await FuseAdminDeployer.new();
            console.log(deployer.address);
        })

        it('should call deployFuseAdmin() and deploy FuseFeeDistributor ', async () => {
            fuseadmin = await deployer.deployFuseAdmin.send();
            console.log(fuseadmin);
        })     
        

    })
})