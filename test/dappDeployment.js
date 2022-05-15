const { web3 } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');


describe('DappDeployment and initialization', () => {
    let fuseAdmin;

    before(async() => {
        const accounts = await web3.eth.getAccounts();
        const EOAboss = accounts[1];
        //deploy fusefeedistributor and initalize admin
        deployer = await FuseAdminDeployer.new();
        await deployer.deployFuseAdmin();
        fuseAdmin = await deployer.fuseadmin.call();
        await deployer.initializeFeeDistributorAndAdmin(2);
    })

    describe('Comptroller deployment', () => {
        it('should deploye comptroller storage', async () => {
            console.log(fuseAdmin);
        })
    })

    
})