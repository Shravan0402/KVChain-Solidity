const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const ether = tokens 

describe("Checking the working of the KYChain contract :- ", ()=>{
    let deployer, inspector, accesser1, accesser2, KYContract
    beforeEach(async ()=>{
        let accounts = await ethers.getSigners();
        deployer = accounts[0]
        inspector = accounts[1]
        accesser1 = accounts[2]
        accesser2 = accounts[3]
        KYContract = await ethers.getContractFactory("KYChain")
        KYContract = await KYContract.deploy()
    })

    it("Checking as if only the inspector can inspect the application", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        expect(async()=> await KYContract.connect(accesser1).reviewApplication(index.value.toString(), 1)).to.be.revertedWith("Only the inspector can review the application")
    })

    it("Checking if the inspector can change the status only once", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        await KYContract.connect(inspector).reviewApplication(index.value.toString(),2)
        expect(async()=> await KYContract.connect(inspector).reviewApplication(index.value.toString(), 2)).to.be.revertedWith("You can only update review once")
    })

    it("Checking if the user can add accesser before verification is completed", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        expect(async()=> await KYContract.connect(deployer).addAccessers(index.value.toString(), accesser1.address)).to.be.revertedWith("Let the inspector check the application before adding accesor's list")
    })

    it("Checking if only the user can add accesser", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        await KYContract.connect(inspector).reviewApplication(index.value.toString(),1)
        expect(async()=> await KYContract.connect(accesser1).addAccessers(index.value.toString(), accesser1.address)).to.be.revertedWith("Only the KYC creator can add the accesor's list")
    })

    it("Checking if the user can add accesser if KYC verification gets failed", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        await KYContract.connect(inspector).reviewApplication(index.value.toString(),2)
        expect(async()=> await KYContract.connect(deployer).addAccessers(index.value.toString(), accesser1.address)).to.be.revertedWith("The KYC verification has failed")
    })

    it("Checking if only the registered accesser can access the KYC data", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        await KYContract.connect(inspector).reviewApplication(index.value.toString(),1)
        await KYContract.connect(deployer).addAccessers(index.value.toString(), accesser1.address)
        expect(async()=> await KYContract.connect(accesser2).getKYC(index.value.toString())).to.be.revertedWith("You are not a verified partner to get the customer KYC")
    })

    it("Checking the whole workflow of the app", async()=>{
        let index = await KYContract.connect(deployer).newApplication(1234, "www.google.com", "hello world", inspector.address, 12082003, 7008439369, "arman@gmail.com")
        await KYContract.connect(inspector).reviewApplication(index.value.toString(),1)
        await KYContract.connect(deployer).addAccessers(index.value.toString(), accesser1.address)
        await KYContract.connect(deployer).addAccessers(index.value.toString(), accesser2.address)
        let res = await KYContract.connect(accesser1).getKYC(index.value.toString())
        expect(res.idno).to.equal(1234)
        expect(res.dob).to.equal(12082003)
    })

})