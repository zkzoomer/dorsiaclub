import styled from 'styled-components';
import {DropdownButton} from 'react-bootstrap';

export const PageContainer = styled.div`
    background-color: #212529;
    min-height: 101vh;
`

export const TokenContainer = styled.div`
    height: 100%;
    background: #212529;

    @media screen and (max-width: 768px) {
        height: auto;
        padding: 0px 0 0px;
        width:100%;
        overflow-x:hidden;
        overflow-y:hidden;
    }
`

export const TokenH1 = styled.h1`
    padding-top: 125px;
    font-size: 2.5rem;
    color: #fff;
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
    color: white;
    position: relative;
    justify-content: center;
    padding-top: 20px;
    margin-bottom: 15px;

    @media screen and (max-width: 768px) {
        padding-bottom: 20px;
        padding-top: 20px;
    };
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
    margin-top: 5px;
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
    margin: 0 0 10px 0;
    padding-right: 0;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

export const VerticalSeparationBar = styled.div`
    border-left: 1px solid white;
    height: 30px;
    left: 50%;
`

const activeClassName = 'active';

export const OptionsButton = styled.button.attrs({
    activeClassName,
})`
    font-size: 1.2rem;
    color: white;
    border: none;
    background: none;
    cursor: pointer;
    padding-left: 20px;
    padding-right: 20px;
    font-weight: 200;
    font-family: 'Royal-Script', serif;
    

    &:hover {
        font-weight: 1000;
    }

    &.${activeClassName} {
        font-weight: 1000;
    }
`

export const AttributeWrapper = styled.div`
    top: 0;
    font-size: 1.2rem;
    height: 100%;

    @media screen and (max-width: 768px) {
        font-size: 1rem;
    };
`

export const AttributeItem = styled.div`
    font-weight: 200;
    font-weight: normal
    margin-bottom: 10px;
`

export const AttributeText = styled.span`
    font-family: 'Royal-Script', serif;
`

export const BoldText = styled.span`
    font-weight: bold;
    font-family: 'Royal-Script', serif;
`

export const DividerLine = styled.hr`
    color: '#E9ECEF';
    background-color: '#E9ECEF';
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
    margin-left: 5%;
    width: 100%;
    position: relative;

    @media screen and (max-width: 768px) {
        margin-left: 15%;
    };
`

export const ButtonWrapper = styled.div`
    margin-top: 32px;
    width: 70%;
    margin-left: 5%;

    @media screen and (max-width: 768px) {
        margin-left: 15%;
    };
`

export const EnabledButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: #E6C229;
    white-space: nowrap;
    padding: 14px 48px;
    color: #010606;
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 100%; 
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: #F8F9FA;
        box-shadow:  0 0 0 2px #F8F9FA;
    }
`

export const DisabledButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: #927A11;
    white-space: nowrap;
    padding: 14px 48px;
    color: #010606;
    font-size: 16px;
    outline: none;
    border: none;
    width: 100%; 
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