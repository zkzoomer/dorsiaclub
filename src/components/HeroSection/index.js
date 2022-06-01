import React from 'react';
import { 
    HeroContainer,
    HeroBg, 
    ImgBg,
    HeroContent,
    HeroH1,
    HeroP,
    HeroBtnWrapper,
    Button
} from './HeroElements';

const HeroSection = () => {
    return (
        <HeroContainer id="home">
            <HeroBg>
                <ImgBg src={require('../../images/background.jpg')} />
            </HeroBg>
            <HeroContent>
                <HeroH1>Customizable NFT Business Cards</HeroH1>
                <HeroP>
                    <i>
                        Because every self-respected businessman
                        needs a business card
                    </i>
                </HeroP>
                <HeroBtnWrapper>
                    <Button to="/mint" id='goto_mint'>
                        Mint
                    </Button>
                </HeroBtnWrapper>
            </HeroContent>
        </HeroContainer>
    );
};

export default HeroSection
