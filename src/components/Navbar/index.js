import { MenuList } from './MenuList';
import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import { animateScroll as scroll } from 'react-scroll';
import { ConnectButton } from './ConnectButton';
import { 
    DorsiaNav, 
    NavbarContainer, 
    NavLogo, 
    MobileIcon, 
    NavMenu, 
    NavItem, 
    NavLinks, 
    NavBtn, 
} from './NavbarElements';

const Navbar = (props) => {
    const [scrollNav, setScrollNav] = useState(false);

    const changeNav = () => {
        if (location['pathname'] === '/') {  // Home page, Navbar starts as transparent, gains color on scroll
            if(window.scrollY >= 80) {
                setScrollNav(true)
            } else {
                setScrollNav(false)
            }
        } else {  // Other pages, Navbar always has color
            setScrollNav(true);
        }
    };

    let location = useLocation();
    useEffect(() => {
        window.addEventListener('scroll', changeNav)
        if (location['pathname'] === '/') {
            setScrollNav(false)
        } else {
            setScrollNav(true)
        }
    // eslint-disable-next-line
    }, [location]);


    const toggleHome = () => {
        scroll.scrollToTop();
    };

    const menuList = MenuList.map(({url, title}, index) => {
        return(
            <NavItem key={index}>
                <NavLinks exact="true" to={url} activeclassname="active" onClick={()=>scroll.scrollToTop()}>
                    {title}
                </NavLinks>
            </NavItem>
        );
    });

    return (
        <>
            <IconContext.Provider value={{ color: 'var(--main-text)' }}>
                <DorsiaNav scrollNav={scrollNav}>
                    <NavbarContainer>
                        <NavLogo to='/' onClick={toggleHome}>Dorsia Club</NavLogo>
                        <MobileIcon onClick={props.toggle} >
                            <FaBars />
                        </MobileIcon>
                        <NavMenu>
                            {menuList}
                        </NavMenu>
                        <NavBtn>
                            <ConnectButton 
                                account = {props.account}
                                setAccount = {props.setAccount}
                                chainId = {props.chainId}
                                setChainId = {props.setChainId}
                            />
                        </NavBtn>
                    </NavbarContainer>
                </DorsiaNav>
            </IconContext.Provider>
        </>
    );
};

export default Navbar
