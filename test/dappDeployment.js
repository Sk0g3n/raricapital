const { web3, assert } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');
const Unitroller = artifacts.require('Unitroller');
const Comptroller = artifacts.require('Comptroller');


describe('DappDeployment and initialization', () => {
    let fuseAdmin, deployer, accounts, EOAboss;

    before(async() => {
        accounts = await web3.eth.getAccounts();
        EOAboss = accounts[1];
        //deploy fusefeedistributor and initalize admin
        deployer = await FuseAdminDeployer.new();
        await deployer.deployFuseAdmin();
        fuseAdmin = await deployer.fuseadmin.call({from: EOAboss});
        await deployer.initializeFeeDistributorAndAdmin(2, {from: EOAboss});
    })

    describe('Comptroller proxy/logic deployment and initalization', () => {
        it('should deployer comptroller proxy/storage', async () => {
            unitroller = await Unitroller.new({from:EOAboss});
            assert.equal(await unitroller.admin.call(), accounts[1]);
        })

        it('should deploy comptroller logic/implementation', async () => {
            comptroller = await Comptroller.new({from:EOAboss, gas:30000000, gasPrice:800000000});
        })

        it('should set the implementation on the logic contract', async () => {
            console.log(comptroller.address);
        })
    })

    
})