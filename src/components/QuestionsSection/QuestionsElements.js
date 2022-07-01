import React from 'react'
import styled from 'styled-components'
import { FaAngleUp } from "react-icons/fa";

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

export const QuestionsContainer = styled.div`
    background: var(--light-background);

    @media screen and (max-width: 820px) {
        padding: 100px 0;
    }
`

export const QuestionsWrapper = styled.div`
    display: grid;
    z-index: 1;
    width: 100%;
    max-width: 1300px;
    margin-right: auto;
    margin-left: auto;
    padding-top: 75px;
    padding-bottom: 75px;
    justify-content: center;

    @media screen and (max-width: 820px) {
        padding: 0px;
    }
`

export const QuestionsRow = styled.div`
    display: grid;
    grid-auto-columns: minmax(auto, 1fr);
    align-items: center;
    grid-template-areas: 'col1 col2';

    @media screen and (max-width: 820px) {
        grid-template-areas: 'col1' 'col2';
    }
`

export const Column1 = styled.div`
    
    padding: 0px 50px 0px; /* KEY THING DONT KNOW WHY THIS WORKS BUT IT MAKES IT LOOK CUTE */ 
    grid-area: col1;
    /* height: 100%;
    width: 100%; */

    @media screen and (max-width: 820px) {
        margin-top: -100px;
        padding: -0px 0 150px;
        width: 100%;
        height: 100%;
    }
`

export const Column2 = styled.div`
    margin-right: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 -0px 0 15px;
    grid-area: col2;
    /* width: 100%;
    height: 63%; */

    @media screen and (max-width: 820px) {
        width: 100%;
        height: 100%;
        /* max-height: 370px; */
        padding: 0 15px 0px 15px;
    }
`

export const ImgWrap = styled.div`
    margin-right: 50px;
`

export const Img = styled.img`
    margin-right: 50px;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

export const AccordionContainer = styled.div`
    overflow: hidden;
    width: 100%;
    border-radius: 0.5rem;
    color: var(--highlighted-text);
`

export const Inner = styled.div`
    position: absolute;
    padding: 1rem;
    color: var(--highlighted-text);
    font-family: 'Royal-Script', serif;
    font-size: 18px;
    padding-left: 30px;
`

export const Header = styled.button`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 4rem;
    padding: 0 1rem;
    font-size: 25px;
    font-family: 'Royal-Script', serif;
    text-align: left;
    background: var(--light-background);
    color: inherit;
    cursor: pointer;
    transition: all 0.2s;
    color: ${props => props.isActive ? 'var(--highlighted-text)' : 'var(--main-text)'};
`

export const HeaderIcon = styled.span`
    transform: rotate(${props => props.isActive ? -180 : 0 }deg);
    transition: all 0.2s;
    color: var(--main-text);
`

export const Content = styled.div`
    position: relative;
    overflow: hidden; 
    height: ${props => {
        const inner = document.getElementById(props.itemName);
        return `${props.isActive && inner ? inner.clientHeight : 0}px`;
    }};
    transition: height 0.35s;
`

export const AccordionContent = ({onClick, itemName, itemContent, isActive}) => {
    return(
        <>
            <Header isActive={isActive} onClick={onClick}>
                {itemName}
                <HeaderIcon isActive={isActive} className='material-icons'>
                    <FaAngleUp />
                </HeaderIcon>
            </Header>
            <Content itemName={itemName} isActive={isActive}>
                <Inner id={itemName}>{itemContent}</Inner>
            </Content>
        </>
    )
}

