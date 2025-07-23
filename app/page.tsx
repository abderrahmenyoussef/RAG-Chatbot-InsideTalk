"use client"
import Image from "next/image"
import Logo from "./assets/Logo.png"
import { useChat } from "ai/react"
import { Message } from "ai"

const Home = () => {

    const { append, isLoading, messages,input, handleInputChange, handleSubmit } = useChat()

    const noMessages = true

    return(
        <main>
            <Image src={Logo} alt="Logo" width={250} />
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (

                    <>
                    <div className="welcome-container">
                        <div>
                            <h1 className="welcome-title">Welcome to InsideTalk</h1>
                            <p className="welcome-subtitle">Your smart companion for internship and job interview preparation</p>
                        </div>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🔍</div>
                                <h3 className="feature-title">Ask Anything</h3>
                                <p className="feature-desc">Get instant answers to all your interview questions</p>
                            </div>
                            
                            <div className="feature-item">
                                <div className="feature-icon">💡</div>
                                <h3 className="feature-title">Real Experiences</h3>
                                <p className="feature-desc">Learn from thousands of real-world interview scenarios</p>
                            </div>
                            
                            <div className="feature-item">
                                <div className="feature-icon">🚀</div>
                                <h3 className="feature-title">Level Up</h3>
                                <p className="feature-desc">Boost your confidence and prepare for success</p>
                            </div>
                        </div>
                    </div>
                    </>

                ) : (

                    <> 
                     {/*<map messages onto text bubbles />*/}
                      {/*<LoadingBubble/>*/}


                      
                
                    </>

                )
                
            }
            <form onSubmit={handleSubmit}>

                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..."/>
                <button type="submit" className="submit-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>

            </form>
            </section>
        </main>
    )

}

export default Home