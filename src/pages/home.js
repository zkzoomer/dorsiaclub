// HOMEPAGE
import React from 'react'
import QuestionsSection from '../components/QuestionsSection';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import { homeObjOne, homeObjTwo, homeObjThree } from '../components/InfoSection/Data';

const Home = () => {
    return (
        <>
            <HeroSection />
            <InfoSection {...homeObjOne} key='Info1'/>
            <InfoSection {...homeObjTwo} key='Info2'/>
            <InfoSection {...homeObjThree} key='Info3'/>
            <QuestionsSection />
            <Footer />
        </>
    );
};

export default Home
