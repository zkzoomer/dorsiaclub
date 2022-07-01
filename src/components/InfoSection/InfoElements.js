import styled from 'styled-components'
import {Link} from 'react-router-dom'

export const InfoContainer = styled.div`
    background: var(--light-background);

    @media screen and (max-width: 820px) {
        padding: 100px 0;
    }
`

export const InfoWrapper = styled.div`
    display: grid;
    z-index: 1;
    height: 700px;
    width: 100%;
    max-width: 1300px;
    margin-right: auto;
    margin-left: auto;
    padding: -0 0px;
    justify-content: center;
`

export const InfoRow = styled.div`
    display: grid;
    grid-auto-columns: minmax(auto, 1fr);
    align-items: center;
    grid-template-areas: ${({imgStart}) => (imgStart ? `'col2 col1'` : `'col1 col2'`)};

    @media screen and (max-width: 820px) {
        grid-template-areas: ${({imgStart}) => 
        (imgStart ? `'col1' 'col2'` : `'col1 col1' 'col2 col2'`)};
    };
`

export const DividerWrapper = styled.div`
    background-color: var(--light-background);
    height: 1px;
    width: 100%;
    margin: auto;
`

export const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
    width: 80%;
    margin: auto;
`


export const Column1 = styled.div`
    padding: 0 15px;
    grid-area: col1;
    height: 63%;
    width: 100%;

    @media screen and (max-width: 820px) {
        width: 100%;
        height: 100%;
    }
`

export const Column2 = styled.div`
    margin-bottom: 15px;
    padding: 0 15px;
    grid-area: col2;
    width: 100%;
    height: 63%;

    @media screen and (max-width: 820px) {
        width: 100%;
        height: 100%;
        max-height: 370px;
        padding-bottom: 20px;
    }
`

export const ImgWrap = styled.div`
`

export const Img = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

export const TextWrapper = styled.div`
    padding-top: 0;
    padding-bottom: 60px;
    margin: right;
    width: 100%;
    position:relative;
`

export const TopLine = styled.p`
    font-size: 16px;
    line-height: 16px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    margin-bottom: 16px;
`

export const Heading = styled.h1`
    color: var(--main-text);
    margin-bottom: 16px;
    font-size: 40px;
    line-height: 1.1;
    font-weight: 600;
    text-align: ${({imgStart}) => (imgStart ? `right` : `justify`)};
    font-family: 'Bookman-Type', serif;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.3));
`

export const Subtitle = styled.p`
    color: var(--main-text);
    margin-top: 40px;
    margin-bottom: 35px;
    max-width: 400px;
    font-size: 20px;
    line-height: 24px;
    text-align: justify;
    margin-left: ${({imgStart}) => (imgStart ? `auto` : `none`)};
    direction: ${({imgStart}) => (imgStart ? `rtl` : `ltr`)};

    font-family: 'Royal-Script', serif;
`

export const BtnWrap = styled.div`
    display: flex;
    justify-content: ${({imgStart}) => (imgStart ? `flex-end` : `none`)};
    align-items: flex-end;
`

export const InfoButton = styled(Link)`
    border-radius: 50px;
    background: var(--button);
    white-space: nowrap;
    padding: 14px 48px;
    color: var(--button-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.3));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`