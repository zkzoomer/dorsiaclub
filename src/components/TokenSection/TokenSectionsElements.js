import styled from 'styled-components';
import { DropdownButton } from 'react-bootstrap';

export const PageContainer = styled.div`
    background-color: var(--light-background);
    min-height: 101vh;
`

export const TokenContainer = styled.div`
    height: 100%;
    background: var(--light-background);

    @media screen and (max-width: 768px) {
        overflow-x: hidden;
        overflow-y: hidden;
        height: 120vh;
    }
`

export const TokenH1 = styled.h1`
    padding-top: 125px;
    font-size: 2.5rem;
    
    color: var(--highlighted-text);
    margin-bottom: 40px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    position: relative;
    filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.5));

    @media screen and (max-width: 768px) {
        font-size: 40px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`

export const OptionsMenuWrapper = styled.div`
    display: grid;
    max-width: 1450px;
    align-items: center;
    margin-left: auto;
    margin-right: auto;

    @media screen and (max-width: 768px) {
        margin-left: 0px;
    };
`

export const OptionsMenu = styled.div`
    justify-self: flex-start;
    display: flex;
    height: 50px;
    align-items: center;
    position: relative;
    width: 40%;
    

    @media screen and (max-width: 768px) {
        width: 100%;
        height: 30px;
    };
`

export const InfoWrapper = styled.div`
    display: grid;
    max-width: 1450px;
    align-items: center;
    padding-left: 30px;
    padding-right: 30px;
    margin-left: auto;
    margin-right: auto;
    

    @media screen and (max-width: 768px) {
        /* margin-left: 30px;
        margin-right: 30px; */
    }
`

export const InfoRow = styled.div`
    display: grid;
    grid-auto-columns: minmax(auto, 1fr);
    align-items: center;
    grid-template-areas: 'col1 col2';

    @media screen and (max-width: 768px) {
        grid-template-areas: 'col1 col1' 'col2 col2';
    };
`

export const Column1 = styled.div`
    height: 100%;
    grid-area: col1;
    color: var(--main-text);
    position: relative;
    justify-content: center;
    padding-top: 10%;
    margin-bottom: 0px;

    @media screen and (max-width: 768px) {
        height: 100%;
        /* padding-top: 20px; */
        padding-bottom: 10%;
        width: 100%;
    };
`

export const ScreenWrapper = styled.div`
`

export const Column2 = styled.div`
    grid-area: col2;
`

export const ImgWrap = styled.div`
    position: relative;
    max-width: 1000px;
    height: 100%;
`

export const ImgDescription = styled.div`   
    color: white;
    font-size: 1.1rem;
    height: 100%;
    line-height: 1.4;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
`

export const Img = styled.img`
    width: 100%;
    height: 100%;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

export const VerticalSeparationBar = styled.div`
    border-left: 1px solid white;
    height: 30px;
    left: 50%;
    color: var(--highlighted-text);
`

const activeClassName = 'active';

export const OptionsButton = styled.button.attrs({
    activeClassName,
})`
    font-size: 1.25rem;
    color: white;
    border: none;
    background: none;
    cursor: pointer;
    padding-left: 20px;
    padding-right: 20px;
    font-weight: 200;
    color: var(--highlighted-text);
    font-family: 'Royal-Script', serif;
    

    &:hover {
        font-weight: bold;
    }

    &.${activeClassName} {
        font-weight: bold;
    }
`

export const AttributeWrapper = styled.div`
    margin-top: -10%;
    padding-top: 15px;
    top: 0;
    font-size: 1.25rem;
    height: 100%;

    @media screen and (max-width: 768px) {
        font-size: 1rem;
        padding-top: 15px;
    };
`

export const DropLink = styled.li`
    background-color: var(--dark-background);
    color: var(--main-text);
    display: none;
    position: absolute;
    min-width: 160px;
    box-shadow: 0px 4px 8px 0px black;
    border-radius: 10px;
    padding: 12px 16px;
    z-index: 1;
    
`

export const DropLinkContents = styled.div`
    font-size: 1.25rem;
    background: var(--dark-background);
    color: var(--main-text);
    padding-top: 10px;
    padding-bottom: 10px;

    &:hover {
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
    }
`

export const AttributeLinks = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;

    bottom: 0;
    color: var(--main-text);
    padding-top: 25px;
    font-size: 2rem;
    display: flex;
    justify-content: flex-start;
    width: 100%;
`

export const LinkWrapper = styled.div`
    padding-right: 25px;

    &:hover ${DropLink} {
        display: block;
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        transform: scale(1.05);
    }
`

export const LinkButton = styled.div`
    padding-right: 25px;

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        cursor: pointer;
        transform: scale(1.05);
    }
`

export const AttributeItem = styled.div`
    font-weight: 200;
    font-weight: normal;
    margin-bottom: 10px;
`

export const AttributeText = styled.span`
    font-family: 'Royal-Script', serif;
    color: var(--main-text)
`

export const BoldText = styled.span`
    font-family: 'Royal-Script', serif;
    color: var(--highlighted-text);
    font-weight: bold;
`

export const DividerLine = styled.hr`
    color: var(--main-text);
    background-color: var(--main-text);
    height: 1px;
    width: 60%;
    justify-self: left;
    margin-left: 0;
    margin-bottom: 10px;

    @media screen and (max-width: 768px) {
        width: 80%;
    };
`

export const TextWrapper = styled.div`
    padding-top: 0px;
    padding-bottom: 15px;
    margin-left: 0%;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const ButtonWrapper = styled.div`
    margin-top: 32px;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const EnabledButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;    
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
    width: 50%;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

export const DisabledButton = styled.button`
width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: var(--disabled-button);
    white-space: nowrap;
    padding: 14px 48px;
    color: var(--button-text);
    font-size: 16px;
    outline: none;
    border: none;
`

export const ChangeInputButton = styled.button`
    width: 10%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    font-size: 1.5rem;
    padding: 14px 0px;
    margin: 0 20px 0 20px;
    background: transparent;
    color: var(--sub-text);

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        transform: scale(1.3);
    }
`

export const SwapDropdownWrapper = styled.div`
`

export const SwapButtonWrapper = styled.div`
    margin-top: 15px;
    width: 70%;
    margin-left: 5%;

    @media screen and (max-width: 768px) {
        margin-left: 15%;
    };
`

export const StyledDropdownButton = styled(DropdownButton)`
    width: 100%; 
    margin-left: 5%;
    text-overflow: ellipsis;

    @media screen and (max-width: 768px) {
        margin-left: 15%;
    };
`

export const ChangeNameWrapper = styled.div`
    padding-top: 100px;
`

export const SwapNameTextWrapper = styled.div`
    width: 70%;
    margin-left: 5%;

    @media screen and (max-width: 768px) {
        width: 100%;
        margin-left: 0%;
    };
`

export const SwapNameText = styled.h1`
    padding-top: 70px;
    font-size: 1.1rem;
    font-family: 'Royal-Script', serif;
    margin-bottom: 15px;
    text-align: center;
`

export const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`