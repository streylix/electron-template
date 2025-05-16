import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    glow = false,
    className = '',
    movementDuration = 2,
    borderWidth = 1,
    disabled = false,
  }) => {
    const containerRef = useRef(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);
    const angleRef = useRef(0);

    const handleMove = useCallback(
      (e) => {
        if (!containerRef.current || disabled) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            if (!glow) element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          if (!glow) element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive && !glow) return;

          const currentAngle = angleRef.current || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;
          
          // Manual animation using CSS variables
          const startTime = Date.now();
          const duration = movementDuration * 1000;
          
          const animateAngle = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Custom easing similar to [0.16, 1, 0.3, 1]
            const easedProgress = progress < 0.5 
              ? 2 * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            const currentValue = currentAngle + (newAngle - currentAngle) * easedProgress;
            angleRef.current = currentValue;
            element.style.setProperty("--start", String(currentValue));
            
            if (progress < 1) {
              requestAnimationFrame(animateAngle);
            }
          };
          
          animateAngle();
        });
      },
      [inactiveZone, proximity, movementDuration, glow, disabled]
    );

    // Auto rotation effect for when there's no mouse movement
    useEffect(() => {
      if (disabled) return;
      
      let autoRotateFrame;
      let startAngle = 0;
      
      // If glow is true and there's no active mouse movement,
      // we'll auto-rotate the glow effect
      const autoRotate = () => {
        if (containerRef.current && glow) {
          startAngle = (startAngle + 0.2) % 360;
          containerRef.current.style.setProperty("--start", String(startAngle));
          containerRef.current.style.setProperty("--active", "1");
        }
        autoRotateFrame = requestAnimationFrame(autoRotate);
      };
      
      if (glow) {
        autoRotateFrame = requestAnimationFrame(autoRotate);
      }
      
      return () => {
        if (autoRotateFrame) {
          cancelAnimationFrame(autoRotateFrame);
        }
      };
    }, [glow, disabled]);

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={`glowing-effect-static ${glow ? 'opacity-100' : 'opacity-0'} ${disabled ? '!block' : ''}`}
        />
        <div
          ref={containerRef}
          style={{
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": glow ? "1" : "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
          }}
          className={`glowing-effect ${glow ? 'opacity-100' : 'opacity-0'} ${blur > 0 ? 'blur-[var(--blur)]' : ''} ${className} ${disabled ? '!hidden' : ''}`}
        >
          <div
            className={`glow-container ${disabled ? '!hidden' : ''}`}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export default GlowingEffect; 