import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  maxRadius: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  radius: number;
}

export function KineticInteractionLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId = 0;
    let isRunning = false;

    // Device & Touch detection
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Coordinate vectors
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let prevTargetX = -1000;
    let prevTargetY = -1000;

    // Velocity & Alpha tracking
    let velocity = 0;
    let smoothedVelocity = 0;
    let cursorAlpha = 0;
    let targetCursorAlpha = 0;

    // Collections
    const ripples: Ripple[] = [];
    const trailPoints: TrailPoint[] = [];

    // Resize handling
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      wakeUp();
    };

    const wakeUp = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Continuous rendering loop
    const render = (timestamp: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // 1. Interpolate Cursor Position (Smooth Lerp / Spring feel)
      if (!isTouch && targetCursorAlpha > 0) {
        currentX += (targetX - currentX) * 0.16;
        currentY += (targetY - currentY) * 0.16;
        cursorAlpha += (targetCursorAlpha - cursorAlpha) * 0.12;

        // Calculate instantaneous velocity
        const dx = targetX - prevTargetX;
        const dy = targetY - prevTargetY;
        prevTargetX = targetX;
        prevTargetY = targetY;
        const instVelocity = Math.sqrt(dx * dx + dy * dy);
        smoothedVelocity += (instVelocity - smoothedVelocity) * 0.15;

        // Subtle kinetic trail creation when moving
        if (instVelocity > 3 && cursorAlpha > 0.3) {
          trailPoints.push({
            x: currentX,
            y: currentY,
            alpha: Math.min(0.4, instVelocity * 0.015),
            radius: Math.min(45, 18 + smoothedVelocity * 0.4)
          });
        }

        // Draw Soft Kinetic Trail Wake
        for (let i = trailPoints.length - 1; i >= 0; i--) {
          const pt = trailPoints[i];
          pt.alpha *= 0.90;
          if (pt.alpha <= 0.005) {
            trailPoints.splice(i, 1);
            continue;
          }
          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${pt.alpha * 0.06})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Smooth Cursor Hover Glow Spotlight
        if (cursorAlpha > 0.005) {
          const dynamicRadius = Math.min(260, 180 + smoothedVelocity * 0.8);
          const cursorGrad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, dynamicRadius);
          cursorGrad.addColorStop(0, `rgba(255, 255, 255, ${0.05 * cursorAlpha})`);
          cursorGrad.addColorStop(0.35, `rgba(255, 255, 255, ${0.02 * cursorAlpha})`);
          cursorGrad.addColorStop(0.7, `rgba(255, 255, 255, ${0.006 * cursorAlpha})`);
          cursorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = cursorGrad;
          ctx.beginPath();
          ctx.arc(currentX, currentY, dynamicRadius, 0, Math.PI * 2);
          ctx.fill();

          // High-tech subtle focal core
          const coreGrad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 28);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.07 * cursorAlpha})`);
          coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(currentX, currentY, 28, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        cursorAlpha *= 0.85;
      }

      // 2. Render Active Click Ripples (Electromagnetic Energy Waves)
      const now = performance.now();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const elapsed = now - r.startTime;
        const progress = elapsed / r.duration;

        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        // Smooth cubic ease-out for realistic wave propagation
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentRadius = r.maxRadius * ease;
        const waveAlpha = Math.max(0, 1 - progress);

        // Click Feedback: Brief central energy burst in the first 120ms
        if (elapsed < 120) {
          const flashProgress = elapsed / 120;
          const flashRadius = 6 + flashProgress * 22;
          const flashA = (1 - flashProgress) * 0.45;

          const flashGrad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, flashRadius);
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashA})`);
          flashGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flashA * 0.5})`);
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(r.x, r.y, flashRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Primary Electromagnetic Pulse Ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.38})`;
        ctx.stroke();

        // Soft Outer Glow Ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.12})`;
        ctx.stroke();

        // Secondary Echo Wave (trailing smoothly inside)
        if (currentRadius > 30) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius * 0.76, 0, Math.PI * 2);
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.16})`;
          ctx.stroke();
        }
      }

      // Check if animation should sleep to conserve resources
      const isMotionSettled =
        Math.abs(targetX - currentX) < 0.2 &&
        Math.abs(targetY - currentY) < 0.2 &&
        (targetCursorAlpha === 0 ? cursorAlpha < 0.005 : Math.abs(targetCursorAlpha - cursorAlpha) < 0.01) &&
        smoothedVelocity < 0.1 &&
        trailPoints.length === 0;

      if (ripples.length === 0 && (isMotionSettled || isTouch)) {
        isRunning = false;
        return;
      }

      animFrameId = requestAnimationFrame(render);
    };

    // Event Handlers
    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetCursorAlpha = 1;

      if (prevTargetX === -1000) {
        prevTargetX = targetX;
        prevTargetY = targetY;
        currentX = targetX;
        currentY = targetY;
      }

      wakeUp();
    };

    const handlePointerLeave = () => {
      targetCursorAlpha = 0;
      wakeUp();
    };

    const handlePointerDown = (e: PointerEvent) => {
      const maxDim = Math.min(window.innerWidth, window.innerHeight);
      const rippleRadius = Math.max(140, Math.min(240, maxDim * 0.26));

      ripples.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
        duration: 780,
        maxRadius: rippleRadius
      });

      wakeUp();
    };

    // Listeners on window
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    resizeCanvas();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="kinetic-interaction-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 5,
        backgroundColor: 'transparent'
      }}
      aria-hidden="true"
    />
  );
}
