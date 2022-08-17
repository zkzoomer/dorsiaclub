import React, { useState, useEffect, useRef } from 'react';
import { ethers } from "ethers"; 
import { 
    defaultURI,
    bCardAddress,
    bCardAbi,
    mPlaceAddress,
    mPlaceAbi,
    mPlaceOracleFee,
    sCardAddress,
    sCardAbi,
} from '../../web3config';
import AttributesSection from './Attributes';
import ChangeNameSection from './ChangeName';
import SwapNameSection from './SwapNames';
import BuyTokenSection from './BuyToken';
import CancelListingSection from './CancelListing';
import CreateListingSection from './CreateListing';
import SendCopySection from './SendCopy';
import SendToOwnerSection from './SendToOwner';
import {
    PageContainer,
    TokenContainer, 
    TokenH1,
    InfoWrapper,
    InfoRow,
    Column1,
    Column2,
    ImgWrap,
    Img,
    ImgDescription,
    OptionsMenu,
    VerticalSeparationBar,
    OptionsButton,
    OptionsMenuWrapper,
    SubSectionWrapper,
    SubSectionMenu,
    MarketplacePricingMenu
} from './TokenSectionsElements';

const TokenPageElements = (props) => {
    // Sections are: Attributes, Change name, Swap names; starts always on attributes
    const [currentSection, setCurrentSection] = useState('Traits');
    const [subSection, setSubSection] = useState('Update card');
    const [owner, setOwner] = useState("");  // which can be the connected `account`, the `marketplace` or `other`
    const [sectionsList, setSectionsList] = useState([{ sectionName: "Traits" }]);
    const [tokenMetadata, setTokenMetadata] = useState(null);
    const [descriptionText, setDescriptionText] = useState("");
    const [loadingText, setLoadingText] = useState("");

    // Smart contracts being used inside the token page
	const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, props.provider);
    const mPlaceContract = new ethers.Contract(mPlaceAddress, mPlaceAbi, props.provider);

    const prevAccount = usePrevious(props.account);
    function usePrevious(value) {
		const ref = useRef();
		useEffect(() => {
		ref.current = value;
		});
		return ref.current;
	}

    const stylizedTokenNumber = () => {
        let num = props.id.toString();
        while (num.length < 4) num = "0" + num;
        return num
    } 

    useEffect(() => {
        async function fetchData() {
            // Check if connected account is owner of this Business Card
            let _cardOwner = null;
            let price = 0;
            let listing_id = 0;
            let isApproved = false;

            // Will update the metadata only once
            if (!tokenMetadata) {
                
                let tokenMetadataURL = null;
                try {
                    tokenMetadataURL = await bCardContract.tokenURI(props.id);
                    const response = await fetch('https://' + tokenMetadataURL + '.ipfs.dweb.link');
                    const data = await response.json();

                    if (tokenMetadataURL === defaultURI) { // Oracle has not updated the token yet
                        setLoadingText("This token is currently being processed by the oracle")
                        setDescriptionText("")
                    } else { // Token has been updated
                        setLoadingText("")
                        setDescriptionText("")
                        // Small modification to the data, we set the discord account to be "" if it is "0"
                        data.card_properties.discord_account = data.card_properties.discord_account === "0" ? "" : data.card_properties.discord_account
                        _cardOwner = await bCardContract.ownerOf(props.id);
                        if (props.account === _cardOwner.toLowerCase()) {
                            isApproved = await bCardContract.isApprovedForAll(props.account, mPlaceContract.address)
                        } else if (mPlaceAddress.toLowerCase() === _cardOwner.toLowerCase()) {
                            const listing = await mPlaceContract.getLatestMarketItemByTokenId(props.id)
                            price = ethers.utils.formatEther(listing[0]['price'])
                            listing_id = listing[0]['itemId'].toString()
                        }
                        data['listing_price'] = price;
                        data['listing_id'] = listing_id;
                        data['is_approved'] = isApproved;
                        setTokenMetadata(data);
                    }
                } catch (err) { // Token does not exist
                    setDescriptionText("This Business Card has not been minted yet")
                }
            }

            try {
                _cardOwner = await bCardContract.ownerOf(props.id);
                if (props.account === _cardOwner.toLowerCase()) {
                    isApproved = await bCardContract.isApprovedForAll(props.account, mPlaceContract.address)
                    setDescriptionText("You are the owner of this Business Card")
                    setOwner("account")
                    setSectionsList([{ sectionName: "Traits" }, { sectionName: "Modify" }, { sectionName: "Trade" }, { sectionName: "Send" }])
                } else if (mPlaceAddress.toLowerCase() === _cardOwner.toLowerCase()) {
                    // If the card owner is the marketplace, it may be an `account` listing or `other`
                    const listing = await mPlaceContract.getLatestMarketItemByTokenId(props.id)
                    if (listing[0]['seller'].toLowerCase() === props.account.toLowerCase()) {
                        setOwner("marketplaceConnectedAccount")
                    } else if (props.account !== "") {
                        setOwner("marketplaceAddress")
                    }
                    setSectionsList(
                        (props.account !== "" && typeof props.account !== "undefined") ? 
                            [{ sectionName: "Traits" }, { sectionName: "Trade" }]
                        :
                            [{ sectionName: "Traits" }]
                        )
                } else {
                    setOwner("other");
                    setSectionsList(
                        (props.account !== "" && typeof props.account !== "undefined") ? 
                            [{ sectionName: "Traits" }, { sectionName: "Send" }] 
                        : 
                            [{ sectionName: "Traits" }]
                    )
                }
            } catch (err) {
                
            }

            // Change of accounts, revert to attribute page if not already there
            if (prevAccount !== props.account && currentSection !== 'Traits') {
                setCurrentSection('Traits')
            }
        }
        fetchData()

    // eslint-disable-next-line
    }, [props.account, owner])


    // Sections shown will depend on wether the token is owned or not
    let SectionsList;
    

    // Option buttons shown to the user depending on his ownership status
    const optionsList = sectionsList.map(({sectionName}, index) => {
        return(
            <React.Fragment key={index}>
                {(index > 0) ? 
                    <div>
                        <VerticalSeparationBar />
                    </div>
                    :
                    <div />
                }
                <OptionsButton 
                    type='optionButton'
                    id={sectionName}
                    onClick={ () => { 
                        setCurrentSection(sectionName)
                    }}
                    className={
                        currentSection === sectionName ? 'active' : ''
                    }
                > 
                    {sectionName}
                </OptionsButton>
            </React.Fragment>
        )
    })

    let SubSectionsList = [
        {
            subSectionName: "Update card",
        },
        {
            subSectionName: "Swap cards",
        },
    ]

    const subSectionList = SubSectionsList.map(({subSectionName}, index) => {
        return(
            <React.Fragment key={index}>
                {(index > 0) ? 
                    <div>
                        <VerticalSeparationBar />
                    </div>
                    :
                    <div />
                }
                <OptionsButton 
                    type='optionButton'
                    id={subSectionName}
                    onClick={ () => { 
                        setSubSection(subSectionName)
                    }}
                    className={
                        subSection === subSectionName ? 'active' : ''
                    }
                > 
                    {subSectionName}
                </OptionsButton>
            </React.Fragment>
        )
    })

    // Displaying the different options components depending on the clicked one, the status of this.state.sectionName
    let section = null;
    if (currentSection === 'Traits') {
        section = <AttributesSection metadata={tokenMetadata}/>
    } else if (currentSection === 'Modify') {
        section = (
            <SubSectionWrapper>
                <SubSectionMenu>
                    {subSectionList}
                </SubSectionMenu>
                {
                subSection === "Update card" ?
                    <ChangeNameSection id={props.id} metadata={tokenMetadata} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
                :
                    <SwapNameSection id={props.id} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
                }
            </SubSectionWrapper>
        )    
    } else if (currentSection === 'Trade') {
        if (owner === 'account') {
            section = (<CreateListingSection id={props.id} isApproved={tokenMetadata['is_approved']} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage} />)
        } else if (owner === 'marketplaceAddress') {
            // Can buy the token
            section = (
                <SubSectionWrapper>
                    <BuyTokenSection id={props.id} metadata={tokenMetadata} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
                    <MarketplacePricingMenu>
                        Listing price: {tokenMetadata['listing_price']} MATIC <br />
                        Oracle fee: {ethers.utils.formatEther(mPlaceOracleFee)} MATIC
                    </MarketplacePricingMenu>
                </SubSectionWrapper>
            )
        } else if (owner === 'marketplaceConnectedAccount') {
            section = (<CancelListingSection id={props.id} metadata={tokenMetadata} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage} />)
        }
    } else if (currentSection === 'Send') {
        if (owner === 'account') {
            section = <SendCopySection id={props.id} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
        } else if (owner === 'other') {
            section = <SendToOwnerSection id={props.id} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
        }
    }

    const Description = () => {
        if (descriptionText) {
            return(
                <ImgDescription>
                    {descriptionText}
                        <br />
                    {loadingText}
                </ImgDescription>
            )
        } else {
            return(
                <ImgDescription>
                    {loadingText}
                </ImgDescription>
            )
        }
    }

    // Page layout
    return (
        <PageContainer>
            <TokenContainer>
                <TokenH1>Business Card #{stylizedTokenNumber()}</TokenH1>
                <OptionsMenuWrapper>
                    <OptionsMenu id='options'>
                        {optionsList}
                    </OptionsMenu>
                </OptionsMenuWrapper>
                <InfoWrapper>
                    <InfoRow>
                        <Column1>
                            {section}
                        </Column1>
                        <Column2>
                            <ImgWrap>
                                <Img src={tokenMetadata ? 'https://' + tokenMetadata.image + '.ipfs.dweb.link' : require('../../images/placeholder_card.png')}/>
                                <Description />
                            </ImgWrap>
                        </Column2>
                    </InfoRow>
                </InfoWrapper>
            </TokenContainer>
        </PageContainer>
    )
}

export default TokenPageElements;