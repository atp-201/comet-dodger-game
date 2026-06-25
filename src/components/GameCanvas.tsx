import React, { useEffect, useRef } from 'react';
import type { GameState, Upgrades } from '../types';

interface GameCanvasProps {
  state: GameState;
  onGameOver: (score: number, coins: number) => void;
}

interface Entity {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Player extends Entity {
  vx: number;
  vy: number;
  shieldTime: number;
  speed: number;
}

interface Comet extends Entity {
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
}

interface Coin extends Entity {
  collected: boolean;
}

interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function GameCanvas({ state, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game state refs
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const playerRef = useRef<Player>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    size: 15, 
    color: '#3b82f6', 
    vx: 0, vy: 0, 
    shieldTime: 0,
    speed: 5 + state.upgrades.speedLevel * 0.5 
  });
  const cometsRef = useRef<Comet[]>([]);
  const coinsArrRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastTimeRef = useRef<number>(0);
  
  // Touch support
  const targetXRef = useRef<number | null>(null);
  const targetYRef = useRef<number | null>(null);

  useEffect(() => {
    // Setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      playerRef.current.x = canvas.width / 2;
      playerRef.current.y = canvas.height / 2;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleTouchStart = (e: TouchEvent) => {
      targetXRef.current = e.touches[0].clientX;
      targetYRef.current = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      targetXRef.current = e.touches[0].clientX;
      targetYRef.current = e.touches[0].clientY;
    };
    const handleTouchEnd = () => {
      targetXRef.current = null;
      targetYRef.current = null;
    };
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);


    // Initial Shield
    playerRef.current.shieldTime = 2000 + state.upgrades.shieldLevel * 500; // ms

    const spawnComet = () => {
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0, vx = 0, vy = 0;
      const speed = 2 + Math.random() * 3 + scoreRef.current / 1000;
      
      switch(edge) {
        case 0: // Top
          x = Math.random() * canvas.width;
          y = -50;
          vy = speed;
          vx = (Math.random() - 0.5) * speed;
          break;
        case 1: // Right
          x = canvas.width + 50;
          y = Math.random() * canvas.height;
          vx = -speed;
          vy = (Math.random() - 0.5) * speed;
          break;
        case 2: // Bottom
          x = Math.random() * canvas.width;
          y = canvas.height + 50;
          vy = -speed;
          vx = (Math.random() - 0.5) * speed;
          break;
        case 3: // Left
          x = -50;
          y = Math.random() * canvas.height;
          vx = speed;
          vy = (Math.random() - 0.5) * speed;
          break;
      }
      
      cometsRef.current.push({
        x, y, vx, vy,
        size: 10 + Math.random() * 20,
        color: state.darkMode ? '#ef4444' : '#b91c1c',
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    };

    const spawnCoin = () => {
      coinsArrRef.current.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        size: 12,
        color: '#fbbf24',
        collected: false
      });
    };

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x, y,
          size: Math.random() * 5 + 2,
          color,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 0,
          maxLife: 30 + Math.random() * 30
        });
      }
    };

    // Stars for background
    const stars: {x: number, y: number, size: number, speed: number, alpha: number}[] = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      alpha: Math.random() * 0.5 + 0.2
    }));

    // Set outfit color
    const baseColor = state.equippedOutfit === 'neon' ? '#06b6d4' : 
                      state.equippedOutfit === 'ninja' ? '#10b981' : 
                      state.equippedOutfit === 'gold' ? '#f59e0b' : '#3b82f6';
    playerRef.current.color = baseColor;
    playerRef.current.size = 20; // Increase size for stickman


    const update = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const player = playerRef.current;

      // Input handling
      let dx = 0;
      let dy = 0;
      
      if (keysRef.current['ArrowUp'] || keysRef.current['w']) dy -= 1;
      if (keysRef.current['ArrowDown'] || keysRef.current['s']) dy += 1;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) dx -= 1;
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        player.vx = (dx / len) * player.speed;
        player.vy = (dy / len) * player.speed;
        targetXRef.current = null; // Clear touch target if keyboard used
      } else if (targetXRef.current !== null && targetYRef.current !== null) {
        const tx = targetXRef.current - player.x;
        const ty = targetYRef.current - player.y;
        const dist = Math.sqrt(tx*tx + ty*ty);
        if (dist > 5) {
          player.vx = (tx / dist) * player.speed;
          player.vy = (ty / dist) * player.speed;
        } else {
          player.vx = 0;
          player.vy = 0;
        }
      } else {
        // Friction
        player.vx *= 0.8;
        player.vy *= 0.8;
      }

      player.x += player.vx;
      player.y += player.vy;

      // Bounds
      player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
      player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

      if (player.shieldTime > 0) {
        player.shieldTime -= dt;
      }

      // Update Comets
      if (Math.random() < 0.05 + scoreRef.current / 50000) {
        spawnComet();
      }

      for (let i = cometsRef.current.length - 1; i >= 0; i--) {
        const c = cometsRef.current[i];
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotSpeed;

        // Collision with player
        const dist = Math.hypot(player.x - c.x, player.y - c.y);
        if (dist < player.size + c.size) {
          if (player.shieldTime > 0) {
            // Destroy comet
            createExplosion(c.x, c.y, c.color);
            cometsRef.current.splice(i, 1);
            scoreRef.current += 10;
          } else {
            // Game Over
            createExplosion(player.x, player.y, player.color);
            onGameOver(Math.floor(scoreRef.current), coinsRef.current);
            return; // Stop animation loop
          }
        } else if (
          c.x < -100 || c.x > canvas.width + 100 ||
          c.y < -100 || c.y > canvas.height + 100
        ) {
          cometsRef.current.splice(i, 1);
        }
      }

      // Update Coins
      if (Math.random() < 0.01) {
        spawnCoin();
      }

      for (let i = coinsArrRef.current.length - 1; i >= 0; i--) {
        const c = coinsArrRef.current[i];
        const dist = Math.hypot(player.x - c.x, player.y - c.y);
        
        // Magnet effect (implicit small magnet)
        if (dist < 100) {
           c.x += (player.x - c.x) * 0.05;
           c.y += (player.y - c.y) * 0.05;
        }

        if (dist < player.size + c.size) {
          coinsRef.current += 1 * state.upgrades.coinMultiplier;
          createExplosion(c.x, c.y, '#fef08a');
          coinsArrRef.current.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.size *= 0.95;
        if (p.life >= p.maxLife || p.size < 0.5) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update Stars
      stars.forEach(star => {
        star.y += star.speed;
        star.x -= player.vx * 0.1; // Parallax effect
        star.y -= player.vy * 0.1;

        if (star.y > canvas.height) star.y = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.x > canvas.width) star.x = 0;
        if (star.x < 0) star.x = canvas.width;
      });

      scoreRef.current += dt * 0.01;

      draw(ctx, canvas.width, canvas.height);
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const isDark = state.darkMode;
      
      // Clear Background with a deep space gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        grad.addColorStop(0, '#020617'); // very dark slate
        grad.addColorStop(0.5, '#0f172a'); 
        grad.addColorStop(1, '#1e1b4b'); // deep indigo
      } else {
        grad.addColorStop(0, '#f8fafc'); 
        grad.addColorStop(0.5, '#e0e7ff'); // light indigo
        grad.addColorStop(1, '#c7d2fe');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        // Twinkle effect
        const alpha = star.alpha * (0.5 + Math.sin(Date.now() * 0.005 * star.speed) * 0.5);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(71, 85, 105, ${alpha})`;
        ctx.fill();
        
        // Glow for bigger stars
        if (star.size > 1.5) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = isDark ? '#ffffff' : '#64748b';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Coins (Glowing Diamonds)
      coinsArrRef.current.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        const scale = 1 + Math.sin(Date.now() / 150) * 0.15;
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        ctx.moveTo(0, -c.size);
        ctx.lineTo(c.size, 0);
        ctx.lineTo(0, c.size);
        ctx.lineTo(-c.size, 0);
        ctx.closePath();

        ctx.fillStyle = '#fef08a'; // bright yellow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#eab308'; // glowing amber
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // Inner shine
        ctx.beginPath();
        ctx.moveTo(0, -c.size * 0.5);
        ctx.lineTo(c.size * 0.5, 0);
        ctx.lineTo(0, c.size * 0.5);
        ctx.lineTo(-c.size * 0.5, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });

      // Draw Particles (Neon sparks)
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const alpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.globalAlpha = 1.0;
      });

      // Draw Comets (Flaming Meteors)
      cometsRef.current.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(Math.atan2(c.vy, c.vx)); // Follow movement direction
        
        // Fire Trail
        ctx.beginPath();
        ctx.moveTo(0, -c.size * 0.8);
        const tailLength = c.size * 4 + Math.random() * c.size * 2;
        ctx.lineTo(-tailLength, 0);
        ctx.lineTo(0, c.size * 0.8);
        ctx.closePath();
        
        const trailGrad = ctx.createLinearGradient(0, 0, -tailLength, 0);
        trailGrad.addColorStop(0, '#fef08a'); // yellow
        trailGrad.addColorStop(0.2, '#f97316'); // orange
        trailGrad.addColorStop(0.6, '#ef4444'); // red
        trailGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = trailGrad;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Meteor Rock
        ctx.beginPath();
        const vertices = 8;
        for(let i=0; i<vertices; i++) {
          const angle = (i/vertices) * Math.PI * 2;
          const r = c.size * (0.8 + Math.random() * 0.4);
          if (i===0) ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
          else ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
        }
        ctx.closePath();
        
        const rockGrad = ctx.createRadialGradient(-c.size*0.2, -c.size*0.2, 0, 0, 0, c.size);
        rockGrad.addColorStop(0, '#78716c'); // light stone
        rockGrad.addColorStop(1, '#292524'); // dark stone
        
        ctx.fillStyle = rockGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f97316'; // intense orange glow
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#1c1917';
        ctx.stroke();

        // Glowing Core/Crater
        ctx.beginPath();
        ctx.arc(-c.size*0.1, c.size*0.1, c.size*0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.5)'; // inner orange glow
        ctx.fill();

        ctx.restore();
      });

      // Draw Player (Neon Stickman)
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x, p.y);

      const angle = Math.atan2(p.vy, p.vx);
      const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1;
      const bobbing = isMoving ? Math.sin(Date.now() / 100) * 3 : 0;
      const legSwing = isMoving ? Math.sin(Date.now() / 80) * 12 : 0;

      // Draw Shield Aura First
      if (p.shieldTime > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size + 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fill();
        
        ctx.strokeStyle = '#38bdf8'; // neon blue
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.globalAlpha = 0.6 + Math.sin(p.shieldTime / 100) * 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      if (isMoving) {
         ctx.rotate(angle + Math.PI/2);
      }

      // Stickman styling
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Neon glow effect for player
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;

      // Head
      ctx.beginPath();
      ctx.arc(0, -12 + bobbing * 0.5, 7, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fill();
      ctx.stroke();
      
      // Visor
      ctx.beginPath();
      ctx.arc(0, -13 + bobbing * 0.5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0; // turn off shadow for visor
      ctx.fill();

      // Body spine
      ctx.shadowBlur = 10; // turn back on
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -5 + bobbing * 0.5);
      ctx.lineTo(0, 10 + bobbing);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(-10, 2 + bobbing);
      ctx.lineTo(0, -2 + bobbing * 0.5);
      ctx.lineTo(10, 2 + bobbing);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(-8 + legSwing*0.5, 22 + bobbing + legSwing);
      ctx.lineTo(0, 10 + bobbing);
      ctx.lineTo(8 - legSwing*0.5, 22 + bobbing - legSwing);
      ctx.stroke();

      // Jetpack thrust particles (if moving)
      if (isMoving) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-5, 12 + bobbing);
        ctx.lineTo(0, 30 + bobbing + Math.random() * 15);
        ctx.lineTo(5, 12 + bobbing);
        const thrustGrad = ctx.createLinearGradient(0, 12, 0, 45);
        thrustGrad.addColorStop(0, '#ffffff');
        thrustGrad.addColorStop(0.3, p.color);
        thrustGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = thrustGrad;
        ctx.fill();
      }

      ctx.restore();

      // Draw HUD overlays
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      
      // Text glow/shadow for readability
      ctx.shadowBlur = isDark ? 4 : 0;
      ctx.shadowColor = isDark ? '#000000' : 'transparent';
      
      // Score
      ctx.fillStyle = isDark ? '#ffffff' : '#1e293b';
      ctx.fillText(`SCORE: ${Math.floor(scoreRef.current)}`, 20, 40);
      
      // Coins
      ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
      ctx.shadowBlur = isDark ? 4 : 0;
      ctx.shadowColor = isDark ? 'rgba(251, 191, 36, 0.5)' : 'transparent';
      ctx.fillText(`COINS: ${coinsRef.current}`, 20, 70);
      
      // Shield
      if (p.shieldTime > 0) {
        ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
        ctx.shadowBlur = isDark ? 4 : 0;
        ctx.shadowColor = isDark ? 'rgba(56, 189, 248, 0.5)' : 'transparent';
        ctx.fillText(`SHIELD: ${Math.ceil(p.shieldTime/1000)}s`, 20, 100);
      }
      ctx.shadowBlur = 0;
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [state, onGameOver]);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full bg-slate-900 touch-none"
    />
  );
}
