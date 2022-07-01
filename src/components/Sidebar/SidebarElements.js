import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

export const SidebarContainer = styled.aside`
    position: fixed;
    z-index: 999;
    width: 50%;
    height: 100%;
    background: var(--light-background-3);
    display: grid;
    align-items: center;
    top: 0;
    left: 0;
    transition: 0.5s ease-in-out;
    opacity: ${({ isOpen }) => (isOpen ? '100%' : '0%')};
    left: ${({ isOpen }) => (isOpen ? '0%' : '-100%')};
`;

export const CloseIcon = styled(FaTimes)`
    color: var(--highlighted-text);
`;

export const Icon = styled.div`
    position: absolute;
    top: 0.8rem;
    left: 0.5rem;
    background: transparent;
    font-size: 2rem;
    cursor: pointer;
    outline: none;
`;

export const SidebarWrapper = styled.div`
    color: var(--highlighted-text);
`;

export const SidebarMenu = styled.ul`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(9, 80px);
    text-align: center;
    width: 100%;

    @media screen and (max-width: 480px){
        grid-template-rows: repeat()(6, 60px);
    }
`

const activeclassname = 'active';

export const SidebarLink = styled(NavLink).attrs({
    activeclassname,
})`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    text-decoration: none;
    list-style: none;
    transition: 0.2s ease-in-out;
    text-decoration: none;
    color: var(--highlighted-text);
    cursor: pointer;
    margin: center;
    border-bottom: 1px white;

    &.${activeclassname} {
        padding-left: 50px;
    }
`

export const SidebarDividerWrapper = styled.div`
    background-color: var(--light-background);
    height: 1px;
    width: 100%;
    margin: auto;

`

export const SideBtnWrap = styled.div`
    display: flex;
    justify-content: center;
`

export const SidebarRoute = styled(NavLink)`
    border-radius: 50px;
    background: var(--light-background);
    white-space: nowrap;
    padding: 16px 64px;
    color: var(--button-text); 
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;

    &:hover {
        transition: all 0.2s ease-in-out;
    }
`
