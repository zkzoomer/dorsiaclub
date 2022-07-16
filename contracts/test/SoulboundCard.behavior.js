const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { default: context } = require('react-bootstrap/esm/AccordionContext');
const { ZERO_ADDRESS } = constants;

const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const ERC721ReceiverMock = artifacts.require('ERC721ReceiverMock');

const Error = [ 'None', 'RevertWithMessage', 'RevertWithoutMessage', 'Panic' ]
  .reduce((acc, entry, idx) => Object.assign({ [entry]: idx }, acc), {});

const firstTokenId = new BN('1');
const secondTokenId = new BN('2');
const thirdTokenId = new BN('3');
const fourthTokenId = new BN(4);
const nonExistentTokenId = new BN('10');

const cardProperties = ['Vice President', 'twitterAccount', 'telegramAccount', 'telegramGroup', '123456789012345678', 'discordGroup', 'githubUsername', 'userWebsite.com']
const firstToken = ['Patrick BATEMAN', cardProperties];
const secondToken = ['Paul ALLEN', cardProperties];
const thirdToken = ['David VAN PATTEN', cardProperties];
const fourthToken = ['Timothy BRYCE', cardProperties];

const mintPrice = web3.utils.toWei('0.1', 'ether');

const baseURI = 'https://api.example.com/v1/';

const RECEIVER_MAGIC_VALUE = '0x150b7a02';

function shouldBehaveLikeERC721 (errorPrefix, owner, newOwner, approved, anotherApproved, operator, other) {
    shouldSupportInterfaces([
        'ERC165',
        'ERC721',
    ]);

    context('with sent Soulbound Cards', function () {

        beforeEach(async function () {
            // Minting two fresh new cards
            await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});   
            await this.bCard.getCard(secondToken[0], secondToken[1], { from: owner, value: mintPrice});
            await this.bCard.getCard(thirdToken[0], thirdToken[1], { from: other, value: mintPrice});
            // Sending them as Soulbound Tokens
            await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
            await this.sCard.sendSoulboundCard(owner, newOwner, 2, { from: owner });
            await this.sCard.sendSoulboundCard(other, newOwner, 3, { from: other });
            this.toWhom = other; // default to other for toWhom in context-dependent tests
        });

        describe('balanceOf', function () {
            context('when the given address received some Soulbound Cards', function () {
                it('returns the amount of Soulbound Cards received by the given address', async function () {
                    expect(await this.sCard.balanceOf(newOwner)).to.be.bignumber.equal('3');
                });
            });

            context('when the given address did not receive any Soulbound Cards', function () {
                it('returns 0', async function () {
                    expect(await this.sCard.balanceOf(other)).to.be.bignumber.equal('0');
                });
            });

            context('when querying the zero address', function () {
                it('throws', async function () {
                    await expectRevert(
                        this.sCard.balanceOf(ZERO_ADDRESS), "ERC721: balance query for the zero address",
                    );
                });
            });
        });

        describe('ownerOf', function () {
            context('when the given token ID was tracked by the Business Card token', function () {
                const tokenId = firstTokenId;
                it('returns the owner of the corresponding Business Card token ID', async function () {
                    expect(await this.sCard.ownerOf(tokenId)).to.be.equal(owner);
                });
            });

            context('when the given token ID was not tracked by this token', function () {
                const tokenId = nonExistentTokenId;
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.ownerOf(tokenId), "ERC721: owner query for nonexistent token",
                    );
                });
            });
        });

        describe('transfers', function () {
            const tokenId = firstTokenId;
            const data = '0x42';

            it('cannot transfer Soulbound Cards', async function () {
                await expectRevert(
                    this.sCard.transferFrom(newOwner, other, 1, { from: newOwner })
                    ,
                    "SCARD: cannot transfer Soulbound Cards"
                )
                await expectRevert(
                    this.sCard.safeTransferFrom(newOwner, other, 1, { from: newOwner })
                    ,
                    "SCARD: cannot transfer Soulbound Cards"
                )

                // Other callers get the same message
                await expectRevert(
                    this.sCard.transferFrom(newOwner, other, 1, { from: owner })
                    ,
                    "SCARD: cannot transfer Soulbound Cards"
                )
                await expectRevert(
                    this.sCard.safeTransferFrom(newOwner, other, 1, { from: owner })
                    ,
                    "SCARD: cannot transfer Soulbound Cards"
                )
            });

            it('cannot approve another address to transfer tokens', async function () {
                await expectRevert(
                    this.sCard.approve(other, 1, { from: newOwner })
                    ,
                    "SCARD: cannot approve Soulbound Cards"
                )
                await expectRevert(
                    this.sCard.setApprovalForAll(other, true, { from: newOwner })
                    ,
                    "SCARD: cannot approve Soulbound Cards"
                )

                // Other callers get the same message
                await expectRevert(
                    this.sCard.approve(other, 1, { from: owner })
                    ,
                    "SCARD: cannot approve Soulbound Cards"
                )
                await expectRevert(
                    this.sCard.setApprovalForAll(other, true, { from: owner })
                    ,
                    "SCARD: cannot approve Soulbound Cards"
                )
            })
        });
    });

    describe('getApproved', async function () {
        context('when token is not minted', async function () {
            it('reverts', async function () {
                await expectRevert(
                    this.sCard.getApproved(nonExistentTokenId),
                    "ERC721: approved query for nonexistent token",
                );
            });
        });

        context('when token has been minted ', async function () {
            beforeEach(async function () {
                await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});   
                await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
            });

            it('should return the zero address', async function () {
                expect(await this.sCard.getApproved(firstTokenId)).to.be.equal(
                    ZERO_ADDRESS,
                );
            });

            context('when account has been approved', async function () {
                beforeEach(async function () {
                    await this.bCard.approve(approved, firstTokenId, { from: owner });
                });

                it('returns approved account', async function () {
                    expect(await this.sCard.getApproved(firstTokenId)).to.be.equal(approved);
                });
            });
        });
    });

    describe('isApprovedForAll', async function () {
        it('should return the zero address', async function () {
            expect(await this.sCard.isApprovedForAll(owner, operator)).to.be.equal(
                false
            );
        })

        context('when operator has been approved', async function () {
            beforeEach(async function () {
                await this.bCard.setApprovalForAll(operator, true, { from: owner })
            })

            it('returns approved account', async function () {
                expect(await this.sCard.isApprovedForAll(owner, operator)).to.be.equal(
                    true
                );
            })
        })

        context('when operator is set as not approved', async function () {
            beforeEach(async function () {
                await this.bCard.setApprovalForAll(operator, false, { from: owner })
            })

            it('returns approved account', async function () {
                expect(await this.sCard.isApprovedForAll(owner, operator)).to.be.equal(
                    false
                );
            })
        })

    });
} 


function shouldBehaveLikeERC721Enumerable (errorPrefix, owner, newOwner, approved, anotherApproved, operator, other) {
    shouldSupportInterfaces([
        'ERC721Enumerable',
    ]);

    context('with minted tokens', function () {
        beforeEach(async function () {
            // Minting two fresh new cards
            await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});   
            await this.bCard.getCard(secondToken[0], secondToken[1], { from: owner, value: mintPrice});
            await this.bCard.getCard(thirdToken[0], thirdToken[1], { from: other, value: mintPrice});
            // Sending them as Soulbound Tokens
            await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
            await this.sCard.sendSoulboundCard(owner, newOwner, 2, { from: owner });
            await this.sCard.sendSoulboundCard(other, newOwner, 3, { from: other });
            this.toWhom = other; // default to other for toWhom in context-dependent tests
        });

        describe('totalSupply', function () {
            it('returns total token supply', async function () {
                expect(await this.sCard.totalSupply()).to.be.bignumber.equal('3');
            });
        });

        describe('tokenOfOwnerByIndex', function () {
            describe('when the given index is lower than the amount of tokens owned by the given address', function () {
                it('returns the token ID placed at the given index', async function () {
                    expect(await this.sCard.tokenOfOwnerByIndex(newOwner, 0)).to.be.bignumber.equal(firstTokenId);
                });
            });

            describe('when the index is greater than or equal to the total tokens owned by the given address', function () {
                it('reverts', async function () {
                    await expectRevert.unspecified(
                        this.sCard.tokenOfOwnerByIndex(newOwner, 3)
                    );
                });
            });

            describe('when the given address does not own any token', function () {
                it('reverts', async function () {
                    await expectRevert.unspecified(
                        this.sCard.tokenOfOwnerByIndex(owner, 0)
                    );
                });
            });
        });

        describe('tokenByIndex', function () {
            it('returns all tokens', async function () {
                const tokensListed = await Promise.all(
                    [0, 1].map(i => this.sCard.tokenByIndex(i)),
                );
                expect(tokensListed.map(t => t.toNumber())).to.have.members([firstTokenId.toNumber(),
                    secondTokenId.toNumber()]);
            });

            it('reverts if index is greater than supply', async function () {
                await expectRevert.unspecified(
                    this.sCard.tokenByIndex(3)
                );
            });
        });
    });

}

function shouldBehaveLikeERC721Metadata (errorPrefix, bCardName, bCardSymbol, sCardName, sCardSymbol, owner) {
    shouldSupportInterfaces([
        'ERC721Metadata',
    ]);

    describe('metadata', function () {
        it('has a name', async function () {
            expect(await this.sCard.name()).to.be.equal(sCardName);
        });

        it('has a symbol', async function () {
            expect(await this.sCard.symbol()).to.be.equal(sCardSymbol);
        });

        it('shares token URI with the corresponding Business Card', async function () {
            // Minting two fresh new cards
            await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});  
            const sCardURI = await this.sCard.tokenURI('1');
            const bCardURI = await this.bCard.tokenURI('1');
            expect(sCardURI).to.be.equal(bCardURI);
        })
    });
}

function shouldBehaveLikeSoulboundCard (errorPrefix, owner, newOwner, receiver, altReceiver, approved, operator) {
    context('with minted Business Cards', function () {
        beforeEach(async function () {
            await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});   
            await this.bCard.getCard(secondToken[0], secondToken[1], { from: owner, value: mintPrice});
            await this.bCard.getCard(thirdToken[0], thirdToken[1], { from: newOwner, value: mintPrice });
        })

        describe('sendSoulboundCard', function () {
            context('when the caller is not owner nor approved', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, receiver, 1, { from: newOwner })
                        ,
                        "SCARD: caller is not owner nor approved"
                    )
                })
            })

            context('when sending a card that is not owned', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, receiver, 3, { from: newOwner })
                        ,
                        "SCARD: sending card that is not own"
                    )
                })
            })

            context('when sending a card to the zero address', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, ZERO_ADDRESS, 1, { from: owner })
                        ,
                        "SCARD: sending to zero address"
                    )
                })
            })

            context('when sending a card to the owner', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, owner, 1, { from: owner })
                        ,
                        "SCARD: sending to owner"
                    )
                })
            })

            context('when the receiver blacklisted themselves', function () {
                it('reverts', async function () {
                    await this.sCard.setBlacklistForAddress(receiver, true, { from: receiver })
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                        ,
                        "SCARD: receiver blacklisted themselves"
                    )
                })
            })

            context('when the recipient already received this card', function () {
                it('reverts', async function () {
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                        ,
                        "SCARD: receiver was already sent the Soulbound Card"
                    )
                })
            })

            context('when the caller is approved for the Business Card', function () {
                it('sends the Soulbound Card', async function () {
                    await this.bCard.approve(newOwner, 1, { from: owner })
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: newOwner })
                })
            })

            context('when the caller is an approved operator', function () {
                it('sends the Soulbound Card', async function () {
                    await this.bCard.setApprovalForAll(newOwner, true, { from: owner })
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: newOwner })
                })
            })

            context('with a successful call', function () {
                let tx;

                beforeEach(async function () {
                    tx = await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                })

                it('includes the token under the recipient\'s set of received tokens', async function () {
                    expect((await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()}))
                        .to.include('1');
                })

                it('includes the recipient under the token\'s set of receivers', async function () {
                    expect(await this.sCard.soulboundCardReceivers('1')).to.include(receiver);
                })

                it('emits a Transfer event', async function () {
                    expectEvent(tx, 'Transfer', { from: owner, to: receiver, tokenId: '1' })
                })
            })
        })

        describe('setBlacklistForAddress', function () {
            context('when caller is not owner nor approved for all', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.setBlacklistForAddress(owner, true, { from: newOwner })
                        ,
                        "SCARD: caller is not owner nor approved for all"
                    )
                    // But this will clear
                    await this.bCard.setApprovalForAll(newOwner, true, { from: owner })
                    this.sCard.setBlacklistForAddress(owner, true, { from: newOwner })
                })
            })

            context('with a successful call', function() {
                beforeEach(async function () {
                    await this.sCard.setBlacklistForAddress(receiver, true, { from: receiver })    
                })
                
                it('can blacklist and revert a blacklist for the specified address', async function () {
                    await expectRevert(
                        this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                        ,
                        "SCARD: receiver blacklisted themselves"
                    )
                    await this.sCard.setBlacklistForAddress(receiver, false, { from: receiver })  
                    // tx clears
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner })
                })

                it('stores the address as blacklisted or not blacklisted', async function () {
                    expect(await this.sCard.isBlacklisted(receiver)).to.be.true;
                    await this.sCard.setBlacklistForAddress(receiver, false, { from: receiver })  
                    expect(await this.sCard.isBlacklisted(receiver)).to.be.false;
                })
            })
        })

    })
    
    context('with sent Soulbound Cards', function () {
        beforeEach(async function () {
            // Minting two fresh new cards
            await this.bCard.getCard(firstToken[0], firstToken[1], { from: owner, value: mintPrice});   
            await this.bCard.getCard(secondToken[0], secondToken[1], { from: owner, value: mintPrice});
            await this.bCard.getCard(thirdToken[0], thirdToken[1], { from: newOwner, value: mintPrice });
            // Sending them as Soulbound Tokens
            await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
            await this.sCard.sendSoulboundCard(owner, altReceiver, 1, { from: owner });
            await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
            await this.sCard.sendSoulboundCard(owner, receiver, 2, { from: owner });
        });

        describe('soulboundCardReceivers', function () {
            context('when the Soulbound Card was not sent to any addresses', function () {
                it('returns an empty list', async function () {
                    expect(await this.sCard.soulboundCardReceivers('3')).to.deep.equal([]);
                })
            })

            context('when Soulbound Card were sent to some addresses', function () {
                it('returns the set of addresses that received a Soulbound Card as a list', async function () {
                    expect(await this.sCard.soulboundCardReceivers('1')).to.deep.equal(
                        [receiver, altReceiver, newOwner]
                    );
                })
            })
        })

        describe('receivedSoulboundCards', function () {
            context('when the address did not receive any Soulbound Cards', function () {
                it('returns an empty list', async function () {
                    expect(await this.sCard.receivedSoulboundCards(owner)).to.deep.equal([])
                })
            })

            context('when the address did receive some Soulbound Cards', function () {
                it('returns the set of Soulbound Cards that were sent as a list', async function () {
                    expect((await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()}))
                        .to.deep.equal(['1', '2']);
                })
            })
        })

        describe('burnSoulboundCard', function () {
            context('when caller is not the receiver nor owner nor approved', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnSoulboundCard(receiver, '1', { from: newOwner })
                        ,
                        "SCARD: caller is not owner nor approved" 
                    )
                    // receiver call clears
                    await this.sCard.burnSoulboundCard(receiver, '1', { from: receiver })
                    // owner call clears
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.burnSoulboundCard(receiver, '1', { from: owner });
                    // approved for this token call clears
                    await this.bCard.approve(approved, '1')
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.burnSoulboundCard(receiver, '1', { from: approved });
                    // operator call clears
                    await this.bCard.setApprovalForAll(operator, true);
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.burnSoulboundCard(receiver, '1', { from: operator });
                })
            })

            context('when card to burn is not in receiver\'s list', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnSoulboundCard(receiver, '3', { from: receiver })
                        ,
                        "SCARD: token not in receiver's list"
                    )
                })
            })

            context('with a successful call', function () {
                let tx

                beforeEach(async function () {
                    tx = await this.sCard.burnSoulboundCard(receiver, '1', { from: receiver })
                })

                it('removes the Soulbound Card from the set of tokens the receiver was sent', async function () {
                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [altReceiver, newOwner].sort()
                    );
                })

                it('removes the Soulbound Card fromt he set of addresses that were sent that token', async function () {
                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    )
                    .to.deep.equal(['2']);
                })

                it('emits a Transfer event to the zero address', async function () {
                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                })
            })
        })

        describe('burnSoulboundCardsOfToken', function () {
            const toBurn = [altReceiver, newOwner];

            context('when caller is not BCARD contract, owner, or approved', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnSoulboundCardsOfToken('1', toBurn, { from: newOwner })
                        ,
                        "SCARD: caller is not BCARD contract nor owner nor approved"
                    )
                    // owner call clears 
                    await this.sCard.burnSoulboundCardsOfToken('1', toBurn, { from: owner })
                    // approved for this token call clears
                    await this.bCard.approve(approved, '1')
                    await this.sCard.sendSoulboundCard(owner, altReceiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
                    this.sCard.burnSoulboundCardsOfToken('1', toBurn, { from: approved })
                    // operator call clears
                    await this.bCard.setApprovalForAll(operator, true, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, altReceiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
                    this.sCard.burnSoulboundCardsOfToken('1', toBurn, { from: operator })
                })
            })

            context('when giving the wrong tokens to burn', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnSoulboundCardsOfToken('1', [altReceiver, newOwner, owner], { from: owner })
                        ,
                        "SCARD: token not on the set"
                    )
                })
            })

            context('when the given token does not exist', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnSoulboundCardsOfToken('350', [receiver], { from: owner })
                        ,
                        "ERC721: owner query for nonexistent token"
                    )
                })
            })

            context('with a successful call', function () {
                let tx

                beforeEach(async function () {
                    tx = await this.sCard.burnSoulboundCardsOfToken('1', toBurn, { from: owner })
                })

                it('clears the specified addresses that were sent this token', async function () {
                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [receiver].sort()
                    );
                })

                it('removes the Soulbound Card from the set of tokens received by the specified addresses', async function () {
                    // receiver, altReceiver, and newOwner were sent the Soulbound Card with index 1
                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.not.include('1')
                })

                it('emits several Transfer events to the zero address', async function () {
                    expectEvent(tx, 'Transfer', { from: altReceiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: newOwner, to: ZERO_ADDRESS, tokenId: '1' })
                })
            })
        })

        describe('burnAllSoulboundCardsOfToken', function () {
            context('when caller is not BCARD contract, owner, or approved', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnAllSoulboundCardsOfToken('1', { from: newOwner })
                        ,
                        "SCARD: caller is not BCARD contract nor owner nor approved"
                    )
                    // owner call clears 
                    await this.sCard.burnAllSoulboundCardsOfToken('1', { from: owner })
                    // approved for this token call clears
                    await this.bCard.approve(approved, '1')
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, altReceiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
                    await this.sCard.burnAllSoulboundCardsOfToken('1', { from: approved })
                    // operator call clears
                    await this.bCard.setApprovalForAll(operator, true, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, altReceiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, newOwner, 1, { from: owner });
                    await this.sCard.burnAllSoulboundCardsOfToken('1', { from: operator })
                })
            })

            context('with a successful call', function () {
                let tx

                beforeEach(async function () {
                    tx = await this.sCard.burnAllSoulboundCardsOfToken('1', { from: owner })
                })

                it('clears the specified addresses that were sent this token', async function () {
                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [].sort()
                    );
                })

                it('removes the Soulbound Card from the set of tokens received by the specified addresses', async function () {
                    // receiver, altReceiver, and newOwner were sent the Soulbound Card with index 1
                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.not.include('1')
                })

                it('emits several Transfer events to the zero address', async function () {
                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: altReceiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: newOwner, to: ZERO_ADDRESS, tokenId: '1' })
                })
            })
        })

        describe('burnReceivedSoulboundCards', function () {
            const toBurn = ['1', '2']

            beforeEach(async function () {
                await this.sCard.sendSoulboundCard(newOwner, receiver, 3, { from: newOwner });
            })

            context('when caller is not owner nor approved', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnReceivedSoulboundCards(receiver, toBurn, { from: altReceiver })
                        ,
                        "SCARD: caller is not receiver nor approved for all"
                    )
                    // owner call clears 
                    await this.sCard.burnReceivedSoulboundCards(receiver, toBurn, { from: receiver })
                    // operator call clears
                    await this.bCard.setApprovalForAll(operator, true, { from: receiver });
                    await this.sCard.sendSoulboundCard(owner, receiver, 1, { from: owner });
                    await this.sCard.sendSoulboundCard(owner, receiver, 2, { from: owner });
                    await this.sCard.burnReceivedSoulboundCards(receiver, toBurn, { from: operator });
                })
            })

            context('when giving the wrong tokens to burn', function () {
                it('reverts', async function () {
                    await expectRevert(
                        this.sCard.burnReceivedSoulboundCards(receiver, ['1', '2', '4'], { from: receiver })
                        ,
                        "SCARD: token not on the set"
                    )
                })
            })

            context('with a successful call', function () {
                let tx

                beforeEach(async function () {
                    tx = await this.sCard.burnReceivedSoulboundCards(receiver, toBurn, { from: receiver })
                })

                it('clears the set of Soulbound Cards received by the specified address', async function () {
                    expect(
                        [...(await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})].sort()
                    ).to.deep.equal(['3'])
                })

                it('clears the address from the set of receivers for each of the token IDs', async function () {
                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [altReceiver, newOwner].sort()
                    );
                    expect([...await this.sCard.soulboundCardReceivers('2')].sort()).to.deep.equal(
                        [].sort()
                    );
                })

                it('emits several Transfer events to the zero address', async function () {
                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '2' })
                })
            })
        })

        describe('interaction with the Business Card smart contract', function () {
            context('when calling bCard `transferFrom`', function () {
                it('burns all the associated Soulbound Cards', async function () {
                    const tx = await this.bCard.transferFrom(owner, newOwner, 1, { from: owner })

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.not.include('1')

                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: altReceiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: newOwner, to: ZERO_ADDRESS, tokenId: '1' })
                })
            })

            context('when calling bCard `transferFromWithoutBurn`', function () {
                it('does not burn the associated Soulbound Cards', async function () {
                    await this.bCard.transferFromWithoutBurn(owner, newOwner, 1, { from: owner })

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [receiver, altReceiver, newOwner].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.include('1')
                })
            })

            context('when calling bCard `safeTranferFrom`', function () {
                it('burns all the associated Soulbound Cards', async function () {
                    const tx = await this.bCard.safeTransferFrom(owner, newOwner, 1, { from: owner })

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.not.include('1')

                    expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: altReceiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: newOwner, to: ZERO_ADDRESS, tokenId: '1' })
                })
            })

        })

        describe('interaction with the Marketplace smart contract', function () {
            const price = web3.utils.toWei('0.1', 'ether');
            const toPay = web3.utils.toWei('0.115', 'ether');  // price + oracleFee, which is 0.015 ETH

            beforeEach(async function () {
                await this.bCard.setApprovalForAll(this.mPlace.address, true, { from: owner })
                await this.mPlace.createMarketItem(1, price, { from: owner })
            })

            context('when listing an item on the Marketplace', function () {
                it('transfers the bCard but does not burn the associated sCards', async function () {
                    expect(await this.bCard.ownerOf('1')).to.be.equal(this.mPlace.address);

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [receiver, altReceiver, newOwner].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.include('1')
                })
            })

            context('when cancelling a Marketplace listing', function () {
                it('transfers back the bCard but does not burn the associated sCards', async function () {
                    await this.mPlace.cancelMarketItem(1, { from: owner })

                    expect(await this.bCard.ownerOf('1')).to.be.equal(owner);

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [receiver, altReceiver, newOwner].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.include('1')
                })
            })

            context('when buying an item on the Marketplace', function () {
                it('transfers the bCard to the buyer burning the associated sCards', async function () {
                    // Need to process the lagged update first tho, newOwner was defined as oracle
                    await this.bCard.updateCallback(1, "", { from: newOwner })
                    const tx = await this.mPlace.createMarketSale(1, fourthToken[0], fourthToken[1], { from: newOwner, value: toPay })
                    expect(await this.bCard.ownerOf('1')).to.be.equal(newOwner);

                    expect([...await this.sCard.soulboundCardReceivers('1')].sort()).to.deep.equal(
                        [].sort()
                    );

                    expect(
                        (await this.sCard.receivedSoulboundCards(receiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(altReceiver)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    expect(
                        (await this.sCard.receivedSoulboundCards(newOwner)).map(n => {return n.toString()})
                    ).to.not.include('1')
                    
                    // Cannot look at nested transactions
                    /* expectEvent(tx, 'Transfer', { from: receiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: altReceiver, to: ZERO_ADDRESS, tokenId: '1' })
                    expectEvent(tx, 'Transfer', { from: newOwner, to: ZERO_ADDRESS, tokenId: '1' }) */
                })
            })
            
        })

    })

    context('when you only have 419 tests', function () {
        describe('it might need just one more', function () {
            it("now it's perfect", function () {
                
            })
        })
    })

}

module.exports = {
  shouldBehaveLikeERC721,
  shouldBehaveLikeERC721Enumerable,
  shouldBehaveLikeERC721Metadata,
  shouldBehaveLikeSoulboundCard
};