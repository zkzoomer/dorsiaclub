import React, { useRef, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';

const Background = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 80px;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 100;
`;

const ModalWrapper = styled.div`
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  max-width: 700px;
  height: 80px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: var(--dark-background);
  color: var(--error);
  position: relative;
  z-index: 100;
  border: 2px solid var(--error);
  border-radius: 10px;

  display: flex;
  align-items: center;

  @media screen and (max-width: 820px) {
    height: 90px;
  }
`;

const ModalContent = styled.div`
  flex-direction: column;
  padding: 5px 50px 0px 15px;
  line-height: 1.8;
  color: var(--highlighted-text);
  z-index: 100;
  width: 100%;
`;

const ModalText = styled.h1`
  font-family: 'Pale-Nimbus';
  font-weight: bold;
  font-size: 23px;
  @media screen and (max-width: 820px) {
    font-size: 20px;
  }
`

const ModalSubtext = styled.h1`
  font-family: 'Pale-Nimbus';  
  font-size: 18px;
  @media screen and (max-width: 820px) {
    font-size: 16px;
  }
`

const CloseModalButton = styled(MdClose)`
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  padding: 0;
  z-index: 100;

  &:hover{
    transition: 0.2s all ease;
    transform: scale(1.1);
  }
`;

export const Modal = ({ showModal, setShowModal, modalText }) => {
  const modalRef = useRef();

  const animation = useSpring({
    config: {
      duration: 250
    },
    opacity: showModal ? 1 : 0,
    transform: showModal ? `translateY(0%)` : `translateY(-100%)`
  });

  const closeModal = e => {
    if (modalRef.current === e.target) {
      setShowModal([]);
    }
  };

  const keyPress = useCallback(
    e => {
      if (e.key === 'Escape' && showModal) {
        setShowModal([]);
      }
    },
    [setShowModal, showModal]
  );

  useEffect(
    () => {
      document.addEventListener('keydown', keyPress);
      return () => document.removeEventListener('keydown', keyPress);
    },
    [keyPress]
  );

  return (
    <>
      {showModal ? (
        <Background onClick={closeModal} ref={modalRef}>
          <animated.div style={animation}>
            <ModalWrapper showModal={showModal}>
              <ModalContent>
                <ModalText>{modalText[0]}</ModalText>
                <ModalSubtext>{modalText[1]}</ModalSubtext>
              </ModalContent>
              <CloseModalButton
                aria-label='Close modal'
                onClick={() => setShowModal(prev => !prev)}
              />
            </ModalWrapper>
          </animated.div>
        </Background>
      ) : null}
    </>
  );
};