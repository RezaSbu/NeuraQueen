
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  text: string;
  onComplete?: () => void;
  speed?: number;
}

const Typewriter: React.FC<Props> = ({ text, onComplete, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  // Use a ref to store the latest callback. 
  // This prevents the useEffect from resetting when the parent re-renders and creates a new function reference.
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    let index = 0;
    setDisplayedText(''); // Reset text when "text" prop actually changes

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        // If we reached the end, clear interval and call complete
        if (index >= text.length) {
          clearInterval(intervalId);
          if (onCompleteRef.current) onCompleteRef.current();
          return text;
        }
        return text.slice(0, index + 1);
      });
      index++;
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]); // Removed onComplete from dependencies

  return (
    <div className={`markdown-content ${displayedText.length < text.length ? 'typing-cursor' : ''}`}>
      <ReactMarkdown
        components={{
          strong: ({node, ...props}) => <span className="font-bold text-primary" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1 text-gray-300" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" {...props} />
        }}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  );
};

export default Typewriter;
