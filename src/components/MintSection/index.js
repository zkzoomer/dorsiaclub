import React, { useState } from 'react';
import InputBoxes from './InputBoxes';
import {
    PageContainer,
    MintContainer,
    InfoWrapper,
    InfoRow,
    Column1,
    Column2,
    ImgWrap,
    Img,
    MintH1,
    ImgDescription,
    ImgLiveName,
    ImgLivePosition,
} from './MintElements';

const MintElements = (props) => {
    const[liveName, setLiveName] = useState("");
    const[livePosition, setLivePosition] = useState("");

    const handleLiveNameChange = (liveName) => {
        setLiveName(liveName);
    };

    const handleLivePositionChange = (livePosition) => {
        setLivePosition(livePosition);
    };

    const inputs = {
        id_1: 'name',
        placeholder_text_1: 'Your name',
        id_2: 'position',
        placeholder_text_2: 'Your position',
    };

    return (
        <PageContainer>
            <MintContainer>
                <MintH1>Mint your own NFT Business Card</MintH1>
                <InfoWrapper>
                    <InfoRow>
                        <Column1>
                            <InputBoxes 
                                inputs={inputs}
                                handleLiveNameChange={handleLiveNameChange}
                                handleLivePositionChange={handleLivePositionChange}
                                account={props.account}
                                chainId={props.chainId}
                                setErrorMessage={props.setErrorMessage}
                            />
                        </Column1>
                        <Column2>
                            <ImgWrap>
                                <Img src={require('../../images/mint_template.png')} alt={'MintTemplate'} />
                                <ImgLiveName>
                                    {liveName}
                                </ImgLiveName>
                                <ImgLivePosition>
                                    {livePosition}
                                </ImgLivePosition>
                                <ImgDescription>Example look, all attributes will get randomly generated. Text is case sensitive.</ImgDescription>
                            </ImgWrap>
                        </Column2>
                    </InfoRow>
                </InfoWrapper>
            </MintContainer>
        </PageContainer>
    )
};

export default MintElements;
