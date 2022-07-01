import styled from "styled-components";
import { Link } from 'react-router-dom';

export const FooterContainer = styled.footer`
    background-color: var(--dark-background);
`

export const FooterWrap = styled.div`
    padding: 24px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 1500px;
    margin: 0 auto;
`

export const SocialMedia = styled.section`
    max-width: 1500px;
    width: 100%;
`

export const SocialMediaWrap = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    max-width: 1600px;
    margin: 40px auto 0 auto;

    @media screen and (max-width: 820px) {
        flex-direction: column;
    }
`

export const SocialIcons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 80px;
`

export const SocialIconLink = styled.a`
    color: var(--main-text);
    font-size: 24px;
    transition: all 0.2s ease-in-out;

    &:hover{
        color: var(--highlighted-text);
        top: -10px;
        transform: scale(1.3);
    }
`

export const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
    width: 80%;
    margin: auto;
`