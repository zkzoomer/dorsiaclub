import React, { useState, useEffect, useRef } from 'react';
import { ethers } from "ethers"; 
import { 
    defaultURI,
    bCardAddress,
    bCardAbi,
} from '../../web3config';
import AttributesSection from './Attributes';
import ChangeNameSection from './ChangeName';
import SwapNameSection from './SwapNames';
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
    OptionsMenuWrapper
} from './TokenSectionsElements';

const TokenPageElements = (props) => {
    // Sections are: Attributes, Change name, Swap names; starts always on attributes
    const [currentSection, setCurrentSection] = useState('Attributes');
    const [ownsToken, setOwnsToken] = useState(false);
    const [tokenMetadata, setTokenMetadata] = useState(null);
    const [descriptionText, setDescriptionText] = useState("");
    const [loadingText, setLoadingText] = useState("");

    // Smart contracts being used inside the token page
	const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, props.provider);
    const mPlaceContract = null;
    const sCardContract = null;

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
            // Will update the metadata only once
            if (!tokenMetadata) {
                
                let tokenMetadataURL = null;
                try {
                    tokenMetadataURL = await bCardContract.tokenURI(props.id);
                    const response = await fetch(tokenMetadataURL);
                    const data = await response.json();

                    if (tokenMetadataURL === defaultURI) { // Oracle has not updated the token yet
                        setLoadingText("This token is currently being processed by the oracle")
                        setDescriptionText("")
                    } else { // Token has been updated
                        setLoadingText("")
                        setDescriptionText("")
                        setTokenMetadata(data);
                    }
                } catch (err) { // Token does not exist
                    setDescriptionText("This Business Card has not been minted yet")
                }

            }


            // Change of accounts, revert to attribute page if not already there
            if (prevAccount !== props.account && currentSection !== 'Attributes') {
                setCurrentSection('Attributes')
            }


            // Check if connected account is owner of this Business Card
            try {
                let owner = null;
                owner = await bCardContract.ownerOf(props.id);
                if (props.account === owner.toLowerCase()) {
                    setDescriptionText("You are the owner of this Business Card")
                    setOwnsToken(true)
                } else {
                    setOwnsToken(false);
                }
            } catch (err) {}
        }
        fetchData()
    // eslint-disable-next-line
    }, [props.account, ownsToken])


    // Sections shown will depend on wether the token is owned or not
    let SectionsList = (ownsToken) 
        ? [
            {
                sectionName: "Attributes",
            },
            // These only get activated IF the token is owned by the connected wallet
            // How it works: await for the token ownership in the back, meanwhile these remain active
            {
                sectionName: "Modify",
            },
            {
                sectionName: "Swap",
            }
        ]
        : [
            {
                sectionName: "Attributes",
            }
        ]

    // Option buttons shown to the user depending on his ownership status
    const optionsList = SectionsList.map(({sectionName}, index) => {
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

    // Displaying the different options components depending on the clicked one, the status of this.state.sectionName
    let section = null;
    if (currentSection === 'Attributes') {
        section = <AttributesSection metadata={tokenMetadata}/>
    } 
    if (currentSection === 'Modify') {
        section = <ChangeNameSection id={props.id} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>;
    } 
    if (currentSection === 'Swap') {
        section = <SwapNameSection id={props.id} account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>;
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
                                <Img src={tokenMetadata ? tokenMetadata.image : require('../../images/placeholder_card.png')}/>
                                <ImgDescription>
                                    <Description />
                                </ImgDescription>
                            </ImgWrap>
                        </Column2>
                    </InfoRow>
                </InfoWrapper>
            </TokenContainer>
        </PageContainer>
    )
}

export default TokenPageElements;