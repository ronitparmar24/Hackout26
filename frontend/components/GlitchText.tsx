"use client";

import React, { useEffect, useState } from "react";

interface Props {
  text: string;
  className?: string;
  speed?: number;
}

const CHARS = "!<>-_\\\\/[]{}—=+*^?#________";

export default function GlitchText({ text, className = "", speed = 30 }: Props) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let frame = 0;
    const length = text.length;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      let output = "";
      let complete = 0;
      for (let i = 0; i < length; i++) {
        if (i < frame) {
          output += text[i];
          complete++;
        } else if (i < frame + 5) {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          output += "";
        }
      }

      setDisplayText(output);

      if (complete === length) {
        return;
      }

      frame += 1 / 3;
      timeoutId = setTimeout(animate, speed);
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, [text, speed]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
}
