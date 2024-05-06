import React, {useState} from 'react';

export const MapPopup = ({text}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const togglePopup = (e) => {
    e.stopPropagation(); // Stop click event from propagating to outer elements
    setIsVisible(prev => !prev);
  };

  return (
    <span style={{
      position: 'relative',
      display: 'inline-block',
      padding: '2px',
      border: '2px solid transparent',
      borderRadius: '5px'
    }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
      <span>{text}</span>
      <span
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          cursor: 'pointer',
          visibility: isVisible ? 'visible' : 'hidden'
        }}
        onClick={togglePopup}>
        🔍
      </span>
      {isVisible && (
        <div style={{
          display: 'block',
          position: 'absolute',
          zIndex: 1000,
          top: '20px',
          right: '0',
          width: '350px',
          height: '350px',
          border: '1px solid black',
          backgroundColor: 'white'
        }}>
          <iframe
            title="map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?width=100%&height=600&hl=en&q=${encodeURIComponent(text)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
          ></iframe>
        </div>
      )}
    </span>
  );
};

export default MapPopup;
