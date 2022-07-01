import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

export const DorsiaNav = styled.nav`
    background: ${({scrollNav}) => (scrollNav ? 'var(--dark-background)' : 'transparent')};
    transition: 0.5s all ease;
    max-height: 80px;
    margin-top: -80px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;

`;

export const NavbarContainer = styled.div`
    display: flex;
    justify-content: space-between;
    text-align: center;
    height: 80px;
    z-index: 1;
    width: 100%;
    padding: 0 0px;
    max-width: 1500px;
`;

export const NavLogo = styled(NavLink)`
    color: var(--main-text);
    justify-self: flex-start;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    margin-left: 20px;
    font-weight: bold;
    text-decoration: none;
    font-feature-settings: "smcp";
    font-family: 'Bookman-Type', serif;

    &:hover {
        color: var(--highlighted-text);
    }

    @media screen and (max-width: 820px) {
        margin-left: 50px;
    }
`;

export const MobileIcon = styled.div`
    display: none;

    @media screen and (max-width: 820px) {
        justify-self: flex-start;
        display: flex;
        align-items: center;
        position: absolute;
        top: 32%;
        left: 10px;
        font-size: 1.8rem;
        cursor: pointer;
        color: var(--main-text);
    }
`;

export const NavMenu = styled.ul`
    justify-self: flex-start;
    display: flex;
    align-items: center;
    list-style: none;
    position: relative;
    text-align: center;
    height: 80px;

    @media screen and (max-width: 820px) {
        display: none;
    }
`;

export const NavItem = styled.li`
    align-items: center;
    height: 80px;
    padding: 0px 10px 0 10px;
`

const activeclassname = 'active';

export const NavLinks = styled(NavLink).attrs({
    activeclassname,
})`
    color: var(--main-text);
    display: flex;
    align-items: center;
    
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    position: relative;
    font-size: 1rem;
    
    &.${activeclassname} {
        color: var(--highlighted-text);
        border-bottom: 1px solid var(--highlighted-text);
        padding-top:0;
    }

    &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 100%;
        width: 0;
        background-color: var(--highlighted-text);
        transition: width .3S ease-in-out;
    }

    &:hover:after {
        border-bottom: 1px solid var(--highlighted-text);
        width: 100%;
        padding-top:0;
    }

    &:hover {
        color: var(--highlighted-text);
    }
`;

export const NavWalletBtn = styled.nav`
    width: 180px;
    border-radius: 50px;
    background: transparent;
    white-space: nowrap;
    margin-right: 10px;
    padding: 10px 20px;
    color: var(--main-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    position: relative;

    &:hover {
        box-shadow:  0 0 0 2px var(--highlighted-text);
        color: var(--highlighted-text);
    }
`

export const BtnContents = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        color: var(--highlighted-text);
    }
`

export const NavWalletBtnWrong = styled.nav`
    width: 180px;
    border-radius: 50px;
    background: var(--error);
    white-space: nowrap;
    margin-right: 10px;
    padding: 10px 20px;
    color: var(--highlighted-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    position: relative;

    &:hover {
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

export const NavWalletBtnText = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--main-text);

    &:hover {
        color: var(--highlighted-text);
    }
`

export const NavBtn = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0px;
`

export const NavBtnLink = styled(NavLink)`
    border-radius: 50px;
    background: var(--highlighted-text);
    white-space: nowrap;
    padding: 10px 22px;
    color: var(--highlighted-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;

    &:hover {
        transition: all 0.2s ease-in-out;
        background: #fff;
    }
`
