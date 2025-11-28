import React, { useEffect, useState } from 'react';
import '../styles/App.css';

const SplashScreen = ({ isLoaded }) => {
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState('Initializing System...');

    useEffect(() => {
        if (isLoaded) {
            // Add a small delay before fading out for a smoother experience
            const timer = setTimeout(() => {
                setVisible(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    // Simulate status updates if loading takes time
    useEffect(() => {
        if (!isLoaded) {
            const timers = [
                setTimeout(() => setStatus('Loading AI Models...'), 1000),
                setTimeout(() => setStatus('Connecting Camera Feed...'), 2500),
                setTimeout(() => setStatus('Calibrating Sensors...'), 4000),
            ];
            return () => timers.forEach(clearTimeout);
        } else {
            setStatus('System Ready');
        }
    }, [isLoaded]);

    if (!visible) return null;

    return (
        <div className={`splash-screen ${isLoaded ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <div className="logo-container">
                    <h1 className="splash-logo">ForceTrack</h1>
                    <div className="splash-badge">AI PRO</div>
                </div>

                <div className="loader-container">
                    <div className="tech-loader">
                        <div className="loader-ring"></div>
                        <div className="loader-core"></div>
                    </div>
                </div>

                <div className="status-text">
                    {status}
                </div>

                <div className="loading-bar-container">
                    <div className={`loading-bar ${isLoaded ? 'complete' : ''}`}></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
