import React, { useState } from "react";

const TweetImage = ({ imageUrl }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleImageVisibility = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <div
                style={{
                    width: '50%',
                    height: isExpanded ? 'auto' : '200px', // Adjust height as needed
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <img
                    src={imageUrl}
                    alt="Tweet"
                    className="img-fluid rounded"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                    }}
                />
                {!isExpanded && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '25px', // Adjust fade height as needed
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
                        }}
                    />
                )}
            </div>
            <button
                onClick={toggleImageVisibility}
                className="btn btn-link p-0 mt-2"
            >
                {isExpanded ? "See Less" : "See More"}
            </button>
        </div>
    );
};

export default TweetImage;