import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

export const DorsiaNav = styled.nav`
    background: ${({scrollNav}) => (scrollNav ? '#1D1F20' : 'transparent')};
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
    color: #E9ECEF;
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
        color: #F8F9FA;
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
        color: #E9ECEF;
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
    color: #E9ECEF;
    display: flex;
    align-items: center;
    
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    position: relative;
    font-size: 1rem;
    
    &.${activeclassname} {
        color: #F8F9FA;
        border-bottom: 1px solid #F8F9FA;
        padding-top:0;
    }

    &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 100%;
        width: 0;
        background-color: #F8F9FA;
        transition: width .3S ease-in-out;
    }

    &:hover:after {
        border-bottom: 1px solid #F8F9FA;
        width: 100%;
        padding-top:0;
    }

    &:hover {
        color: #F8F9FA;
    }
`;

export const NavWalletBtn = styled.nav`
    width: 180px;
    border-radius: 50px;
    background: transparent;
    white-space: nowrap;
    margin-right: 10px;
    padding: 10px 20px;
    color: #F8F9FA;
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    position: relative;

    &:hover {
        box-shadow:  0 0 0 2px #F8F9FA;
    }
`

export const BtnContents = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

export const NavWalletBtnWrong = styled.nav`
    width: 180px;
    border-radius: 50px;
    background: #BF211E ;
    white-space: nowrap;
    margin-right: 10px;
    padding: 10px 20px;
    color: #F8F9FA;
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    position: relative;

    &:hover {
        box-shadow:  0 0 0 2px #F8F9FA;
    }
`

export const NavWalletBtnText = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #F8F9FA;
`

export const NavBtn = styled.nav`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0px;
`

export const NavBtnLink = styled(NavLink)`
    border-radius: 50px;
    background: #F8F9FA;
    white-space: nowrap;
    padding: 10px 22px;
    color: #F8F9FA;
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
