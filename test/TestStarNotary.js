const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let gas = web3.utils.toWei(".0001", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice: gas});
    const balance1AfterUser2BuysStar = await web3.eth.getBalance(user1);
    const balance2AfterUser2BuysStar = await web3.eth.getBalance(user2);
    assert.ok(balance2AfterUser2BuysStar < balanceOfUser2BeforeTransaction);
    assert.ok(balance1AfterUser2BuysStar > balanceOfUser1BeforeTransaction);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 6;
    await instance.createStar('awesome star', starId, {from: user1});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const name = await instance.name.call();
    const symbol = await instance.symbol.call();

    assert.equal(name, "Udacity Star Token");
    assert.equal(symbol, "UST");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId1 = 7;
    const starId2 = 8;

    await instance.createStar('awesome star 1', starId1, {from: user1});
    await instance.createStar('awesome star 2', starId2, {from: user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    let owner1 = await instance.ownerOf.call(starId1);
    let owner2 = await instance.ownerOf.call(starId2);

    assert.equal(user1, owner1);
    assert.equal(user2, owner2);

    await instance.exchangeStars(starId1, starId2, {from: user1});

    // 3. Verify that the owners changed
    owner1 = await instance.ownerOf.call(starId1);
    owner2 = await instance.ownerOf.call(starId2);

    assert.equal(user1, owner2);
    assert.equal(user2, owner1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 9;
    await instance.createStar('awesome star', starId, {from: user1});

    // 2. use the transferStar function implemented in the Smart Contract
    let owner = await instance.ownerOf.call(starId);
    assert.equal(user1, owner);

    await instance.transferStar(user2, starId, {from: user1});

    // 3. Verify the star owner changed.
    owner = await instance.ownerOf.call(starId);
    assert.equal(user2, owner);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 10;
    const name = 'awesome star'
    await instance.createStar(name, starId, {from: user1});

    // 2. Call your method lookUptokenIdToStarInfo
    const returnedName = await instance.lookUptokenIdToStarInfo.call(starId);

    // 3. Verify if you Star name is the same
    assert.equal(returnedName, name);
});