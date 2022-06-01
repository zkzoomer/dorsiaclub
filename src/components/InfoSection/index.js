import React from 'react';
import { animateScroll as scroll } from "react-scroll";
import {
    InfoContainer,
    InfoWrapper,
    InfoRow,
    Column1,
    Column2,
    TextWrapper,
    Heading,
    Subtitle,
    BtnWrap,
    ImgWrap,
    Img,
    DividerLine,
    DividerWrapper,
    InfoButton
} from './InfoElements';

const InfoSection = ({
    id,
    imgStart, 
    lightText, 
    headline1, 
    headline2,
    darkText, 
    description, 
    img, 
    alt,
    buttonLabel,
    buttonTo,
}) => {
    return (
        <>
            <DividerWrapper>
                <DividerLine />
            </DividerWrapper>
            <InfoContainer id={id}>
                <InfoWrapper>
                    <InfoRow imgStart={imgStart}>
                        <Column1>
                            <TextWrapper>
                                <Heading lightText={lightText} imgStart={imgStart} key='headline1'>{headline1}</Heading>
                                <Heading lightText={lightText} imgStart={imgStart} key='headline2'>{headline2}</Heading>
                                <Subtitle darkText={darkText} imgStart={imgStart}>{description}&lrm;</Subtitle>
                                <BtnWrap imgStart={imgStart}>
                                    <InfoButton to={buttonTo} onClick={()=>scroll.scrollToTop()}>
                                        {buttonLabel}
                                    </InfoButton>
                                </BtnWrap>
                            </TextWrapper>
                        </Column1>
                        <Column2>  
                            <ImgWrap>
                                <Img src={img} alt={alt}/>
                            </ImgWrap>
                        </Column2>
                    </InfoRow>
                </InfoWrapper>
            </InfoContainer>
        </>
    )
}

export default InfoSection
