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
        id_3: 'twitterAccount',
        placeholder_text_3: 'Twitter account',
        id_4: 'telegramAccount',
        placeholder_text_4: 'Telegram account',
        id_5: 'telegramGroup',
        placeholder_text_5: 'Telegram group',
        id_6: 'githubAccount',
        placeholder_text_6: 'Github account',
        id_7: 'discordAccount',
        placeholder_text_7: 'Discord account',
        id_8: 'discordGroup',
        placeholder_text_8: 'Discord group',
        id_9: 'website',
        placeholder_text_9: 'Website',
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
                                provider={props.provider}
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
