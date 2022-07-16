import React from 'react';
import { 
    FaTelegramPlane,
    FaTwitter,
    /* FaDiscord */
} from 'react-icons/fa'
import {
    FooterContainer,
    FooterWrap,
    SocialMedia,
    SocialMediaWrap,
    SocialIcons,
    SocialIconLink,
    DividerLine
} from './FooterElements'

const Footer = () => {

    return (
        <FooterContainer>
            <DividerLine />
            <FooterWrap>
                <SocialMedia>
                    <SocialMediaWrap>
                        <SocialIcons>
                            <SocialIconLink href='https://t.me/DorsiaClub' target='_blank' aria_label='Telegram'>
                                <FaTelegramPlane />
                            </SocialIconLink>
                            <SocialIconLink href='https://twitter.com/0xdeenz' target='_blank' aria_label='Twitter'>
                                <FaTwitter />
                            </SocialIconLink>
                        </SocialIcons>
                    </SocialMediaWrap>
                </SocialMedia>
            </FooterWrap>
        </FooterContainer>
    )
}

export default Footer
