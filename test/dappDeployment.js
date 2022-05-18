const { web3, assert } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');
const Unitroller = artifacts.require('Unitroller');
const Comptroller = artifacts.require('Comptroller');
const JumpRateModel = artifacts.require('JumpRateModel');
const CEtherDelegate = artifacts.require('CEtherDelegate');


describe('DappDeployment and initialization', () => {
    let fuseAdmin, deployer, accounts, EOAboss, unitroller, calldata, interestmodel, cetherdelegate;

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
                                8,
                                1);
            
            //console.log(calldata);            
        })

        it('should decode constructordata', async () => {
            decoded = await deployer.decode(calldata);
            //console.log(decoded);
        })

        it('should deploy a new CEther token market', async () => {
            cether = await comptroller._deployMarket(true, calldata, 75, {from:EOAboss, gas:30000000, gasPrice:800000000});
            console.log(cether);
        })
    })

    
})