import React, { useRef, useState } from 'react';

const SwipeBackWrapper = ({ children, onBack }) => {
  const touchStartX = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX.current - currentX;
    
    // Only allow left swipes (positive diffX)
    if (diffX > 0) {
      setSwipeOffset(Math.min(diffX, 100)); // Cap at 100px
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) { // If swiped more than 60px
      onBack();
    }
    setSwipeOffset(0);
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        touchAction: 'pan-y',
        transform: `translateX(-${swipeOffset / 3}px)`,
        transition: swipeOffset === 0 ? 'transform 0.2s ease' : 'none',
      }}
    >
      {children}
      {swipeOffset > 0 && (
        <div 
          className="fixed left-0 top-0 bottom-0 w-2 bg-blue-500 opacity-50"
          style={{ width: `${swipeOffset / 5}px` }}
        />
      )}
    </div>
  );
};

export default SwipeBackWrapper;