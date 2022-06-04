import React from "react"
import './office.css';
import {
    OfficeContainer, 
    TimelineTitle,

} from './OfficeSectionsElements';
class Office extends React.Component {
    render () {
        return(
            <OfficeContainer>
                <TimelineTitle>Roadmap</TimelineTitle>
                <section className="timeline-section">
                    <div className="timeline-items">
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q2 2022</div>
                            <div className="timeline-content">
                                <h3>Project Launch</h3>
                                <p>Official launch of Dorsia Club, the only fully customizable NFT Business Cards. Date TBD.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q2 2022</div>
                            <div className="timeline-content">
                                <h3>Partnerships and Community</h3>
                                <p>Partnering with other names of the scene and further development of the Dorsia Club community.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q3 2022</div>
                            <div className="timeline-content">
                                <h3>Marketplace Release</h3>
                                <p>Launch of our own on-chain marketplace, specifically designed for the trading of Business Cards.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q3 2022</div>
                            <div className="timeline-content">
                                <h3>Marketplace Listings</h3>
                                <p>Listing on third party marketplaces of the space for a bigger reach.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q3 2022</div>
                            <div className="timeline-content">
                                <h3>Card Betting Game</h3>
                                <p>Launch of our provably-fair, on-chain betting game, powered by our Business Card smart contract.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">Q4 2022</div>
                            <div className="timeline-content">
                                <h3>And More!</h3>
                                <p>Special use cases, further expansion, and development of the project.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </OfficeContainer>
    )}
}

export default Office