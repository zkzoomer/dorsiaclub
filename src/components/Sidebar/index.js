import React, { useEffect, useRef } from 'react';
import { MenuList } from '../Navbar/MenuList';
import { 
    SidebarContainer,
    Icon,
    CloseIcon,
    SidebarWrapper,
    SidebarMenu,
    SidebarLink,
}
from './SidebarElements';

let useClickOutside = (handler) => {
    let domNode = useRef();
  
    useEffect(() => {
      let maybeHandler = (event) => {
        if (!domNode.current.contains(event.target)) {
          handler();
        }
      };
  
      document.addEventListener("mousedown", maybeHandler);
  
      return () => {
        document.removeEventListener("mousedown", maybeHandler);
      };
    });
  
    return domNode;
};


function Sidebar({ isOpen, toggle, setIsOpen }){

    let domNode = useClickOutside(() => {
        setIsOpen(false);
    });

    const menuList = MenuList.map(({url, title}, index) => {
        return(
            <SidebarLink key={index} exact="true" to={url} activeclassname="active" >
                {title}
            </SidebarLink>
        );
    });

    return (
        <SidebarContainer ref={domNode} isOpen={ isOpen }>
            <Icon onClick={ toggle }>
                <CloseIcon />
            </Icon>
            <SidebarWrapper>
                <SidebarMenu>
                    { menuList }
                </SidebarMenu>
            </SidebarWrapper>
        </SidebarContainer>
    )
}

export default Sidebar;


// https://youtu.be/eWO1b6EoCnQ