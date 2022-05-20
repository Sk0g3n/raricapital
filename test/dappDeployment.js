const { web3, assert } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');
const Unitroller = artifacts.require('Unitroller');
const Comptroller = artifacts.require('Comptroller');
const JumpRateModel = artifacts.require('JumpRateModel');
const CEtherDelegate = artifacts.require('CEtherDelegate');
const FuseFeeDistributor = artifacts.require('FuseFeeDistributor');


describe('DappDeployment and initialization', () => {
    let fuseAdmin, deployer, accounts, cunitroller, EOAboss, unitroller, calldata, interestmodel, cetherdelegate;

    before(async() => {
        accounts = await web3.eth.getAccounts();
        EOAboss = accounts[1];
        //deploy fusefeedistributor and initalize admin
        deployer = await FuseAdminDeployer.new();
        await deployer.deployFuseAdmin();
        fuseAdmin = await deployer.fuseadmin.call({from: EOAboss});
        await deployer.initializeFeeDistributorAndAdmin(2, {from: EOAboss});
        fusefeedistributor = await FuseFeeDistributor.at('0xa16E02E87b7454126E5E10d957A927A7F5B5d2be');
    })

    describe('Comptroller proxy/logic deployment and initalization', () => {
        it('should deployer comptroller proxy/storage', async () => {
            unitroller = await Unitroller.new({from:EOAboss});
            cunitroller = await Comptroller.at(unitroller.address);
            assert.equal(await unitroller.admin.call(), accounts[1]);
        })

        it('should deploy comptroller logic/implementation', async () => {
            comptroller = await Comptroller.new({from:EOAboss, gas:30000000, gasPrice:800000000});
        })

        it('should add the implementation on the implementations whitelist', async () => {
            //console.log(comptroller.address);
            //set new implementation in comptrollerImplementationWhitelist in FuseFeeDistributor, from owner which is the deployer contract
            await deployer.editComptrollerImplementationWhitelist(comptroller.address);
            //call _setPendingImplementation on unitroller from admin EOABOSS
            await unitroller._setPendingImplementation(comptroller.address, {from:EOAboss, gas:30000000, gasPrice:800000000});            
            assert.equal(await unitroller.pendingComptrollerImplementation.call(), comptroller.address);
        })

        it('should accept new implementation', async () => {
            await comptroller._become(unitroller.address, {from:EOAboss});
            assert.equal(await unitroller.comptrollerImplementation.call(), comptroller.address);
        })

        it('should check if oldImplementation a', async () => {
            comptrollerimplementation = await unitroller.comptrollerImplementation.call();
            assert.equal(await fusefeedistributor.latestComptrollerImplementation(comptrollerimplementation), comptrollerimplementation);
        })

        it('should deploy the interest rate model and initialize it on comptroller', async () => {
            interestmodel = await JumpRateModel.new(12, 2, 4, 81);
            console.log(interestmodel.address);
        })

        it('should deploy CEtherDelegate logic/implementation of CEther', async () => {
            cetherdelegate = await CEtherDelegate.new();
            console.log(cetherdelegate.address);
        })

        it('should encode constructordata to pass as calldata to deployCether', async () => {
            calldata = await deployer.encode(unitroller.address,
                                interestmodel.address,
                                'ScamToken',
                                'SCT',
                                cetherdelegate.address,
                                '0x00',
                                1,
                                1);
            
            //console.log(calldata);            
        })

        it('should decode constructordata', async () => {
            decoded = await deployer.decode(calldata);
            //console.log(decoded);
        })

        it('should add the cetherdelegate/logic to cether implementation whitelist on fuseadmin', async () => {
            await deployer.editcEtherImplementationWhitelist(cetherdelegate.address);
            console.log(await fusefeedistributor.cEtherDelegateWhitelist('0x0000000000000000000000000000000000000000',cetherdelegate.address,true));
        })

        it('should deploy a new CEther token market', async () => {
            //console.log(cunitroller.address);

            await cunitroller._deployMarket(true, calldata, 1, {from:EOAboss, gas:30000000, gasPrice:800000000});
            console.log(await fusefeedistributor.proxyAdd.call());
            onsole.log(cunitroller);
        })
    })

    
})