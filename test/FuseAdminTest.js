const { web3, assert } = require("hardhat");

const FuseAdminDeployer = artifacts.require('FuseAdminDeployer');
const FuseFeeDistributor = artifacts.require('FuseFeeDistributor');

describe('FuseFeeDistributorDeployer', () => {
    let accounts, Admin, deployer, fuseadmin;

    before(async() => {
        accounts = await web3.eth.getAccounts();
        Admin = accounts[0];
    })

    describe('Testing FuseFeeDistributor deployment and initialization', () => {
        it('should deploy FuseAdminDeployer', async() => {
            deployer = await FuseAdminDeployer.new();
            //deployer = await new web3.eth.Contract(FuseAdminDeployer.abi).deploy({data:FuseAdminDeployer.bytecode}).send({from: Admin, gas:30000000, gasPrice:1000000000});
            //console.log(deployer.address);
        })

        it('should call deployFuseAdmin() and deploy FuseFeeDistributor ', async () => {
            //fuseadmin = await deployer.methods.deployFuseAdmin().send({from:Admin, gas: 5000000});
            await deployer.deployFuseAdmin();
            fuseadmin = await deployer.fuseadmin.call();
            //console.log(fuseadmin);
        })  
        
        it('should call initialize on the deployed admin contract', async () => {

            fuseadmininterface = await FuseFeeDistributor.at(fuseadmin);
            await deployer.initializeFeeDistributorAndAdmin(2);
            //await fuseadmininterface.initialize(2, {from: Admin});
            assert.equal(2, await fuseadmininterface.defaultInterestFeeRate.call());
        })

        xit('should read the deployed admin contracts storage slots', async () => {
            fuseadmininterface = await FuseFeeDistributor.at(fuseadmin);
            console.log(await fuseadmininterface.defaultInterestFeeRate.call());

                for (index = 0; index < 30; index++){
                    console.log(`[${index}]` + 
                    await web3.eth.getStorageAt(fuseadmin, index));
            }
        })
        
    })
})