/**
 * ==========================================================
 * ALBARRACÍN RETRO ARCADE 1984 — MOTOR OFICIAL DE VIDEOJUEGOS
 * Estética Atari 2600 / 8-Bit Arcade / Web Audio API / Canvas
 * ==========================================================
 */

(function () {
  'use strict';

  // ==========================================================
  // 1. MOTOR DE AUDIO RETRO 8-BIT (WEB AUDIO API SINTETIZADO)
  // Sin archivos externos, 100% sintetizado, reactivo y ligero
  // ==========================================================
  class ArcadeAudio {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('albarracin_arcade_mute') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('albarracin_arcade_mute', this.muted);
      return this.muted;
    }

    playTone(freq, type = 'square', duration = 0.1, startVol = 0.15) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio error handling
      }
    }

    coin() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    startFanfare() {
      if (this.muted) return;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'square', 0.12, 0.18), idx * 70);
      });
    }

    pickup() {
      this.playTone(880, 'square', 0.06, 0.12);
      setTimeout(() => this.playTone(1320, 'square', 0.1, 0.15), 50);
    }

    jump() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    hit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        // Ruido blanco simulado para explosión/choque 8-bit
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {
        this.playTone(110, 'sawtooth', 0.18, 0.2);
      }
    }

    success() {
      this.playTone(523.25, 'triangle', 0.1, 0.2); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.2), 90); // E5
      setTimeout(() => this.playTone(783.99, 'triangle', 0.2, 0.25), 180); // G5
    }

    gameover() {
      const notes = [440, 392, 349, 293];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sawtooth', 0.2, 0.18), idx * 160);
      });
    }

    tool() {
      this.playTone(330, 'square', 0.05, 0.15);
      setTimeout(() => this.playTone(493.88, 'square', 0.08, 0.18), 40);
    }
  }

  // ==========================================================
  // 2. GESTOR DE ENTRADA (KEYBOARD & VIRTUAL GAMEPAD MOBILE)
  // ==========================================================
  class ArcadeInput {
    constructor() {
      this.keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        action: false, // Space / A
        tool: false,   // B
        start: false,
        pause: false,
        tool1: false,
        tool2: false,
        tool3: false,
        tool4: false
      };

      this.setupKeyboard();
      this.setupTouchGamepad();
    }

    setupKeyboard() {
      window.addEventListener('keydown', (e) => {
        // Prevenir scroll si el foco está en el arcade
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          const arcadeElem = document.getElementById('arcade-container');
          if (arcadeElem && arcadeElem.contains(document.activeElement || e.target)) {
            e.preventDefault();
          }
        }

        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.keys.left = true;
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.keys.right = true;
            break;
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.keys.up = true;
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.keys.down = true;
            break;
          case ' ':
          case 'z':
          case 'Z':
            this.keys.action = true;
            break;
          case 'x':
          case 'X':
            this.keys.tool = true;
            break;
          case 'Enter':
            this.keys.start = true;
            break;
          case 'p':
          case 'P':
            this.keys.pause = true;
            break;
          case '1':
            this.keys.tool1 = true;
            break;
          case '2':
            this.keys.tool2 = true;
            break;
          case '3':
            this.keys.tool3 = true;
            break;
          case '4':
            this.keys.tool4 = true;
            break;
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.keys.left = false;
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.keys.right = false;
            break;
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.keys.up = false;
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.keys.down = false;
            break;
          case ' ':
          case 'z':
          case 'Z':
            this.keys.action = false;
            break;
          case 'x':
          case 'X':
            this.keys.tool = false;
            break;
          case 'Enter':
            this.keys.start = false;
            break;
          case 'p':
          case 'P':
            this.keys.pause = false;
            break;
          case '1':
            this.keys.tool1 = false;
            break;
          case '2':
            this.keys.tool2 = false;
            break;
          case '3':
            this.keys.tool3 = false;
            break;
          case '4':
            this.keys.tool4 = false;
            break;
        }
      });
    }

    setupTouchGamepad() {
      const bindBtn = (id, keyName) => {
        const el = document.getElementById(id);
        if (!el) return;

        const press = (e) => {
          e.preventDefault();
          this.keys[keyName] = true;
          el.classList.add('pressed');
          if (window.arcadeApp && window.arcadeApp.audio) {
            window.arcadeApp.audio.init();
          }
        };

        const release = (e) => {
          e.preventDefault();
          this.keys[keyName] = false;
          el.classList.remove('pressed');
        };

        el.addEventListener('touchstart', press, { passive: false });
        el.addEventListener('touchend', release, { passive: false });
        el.addEventListener('touchcancel', release, { passive: false });
        el.addEventListener('mousedown', press);
        el.addEventListener('mouseup', release);
        el.addEventListener('mouseleave', release);
      };

      bindBtn('btn-dpad-up', 'up');
      bindBtn('btn-dpad-down', 'down');
      bindBtn('btn-dpad-left', 'left');
      bindBtn('btn-dpad-right', 'right');
      bindBtn('btn-arcade-a', 'action');
      bindBtn('btn-arcade-b', 'tool');
      bindBtn('btn-arcade-start', 'start');
    }
  }

  // ==========================================================
  // 3. GESTOR DE PUNTAJES Y CONFIANZA COMERCIAL
  // ==========================================================
  class ArcadeScoreManager {
    constructor() {
      this.scores = {
        moto: parseInt(localStorage.getItem('albarracin_arcade_hs_moto') || '1250', 10),
        invaders: parseInt(localStorage.getItem('albarracin_arcade_hs_invaders') || '1800', 10),
        taller: parseInt(localStorage.getItem('albarracin_arcade_hs_taller') || '2100', 10),
        ruta: parseInt(localStorage.getItem('albarracin_arcade_hs_ruta') || '2500', 10)
      };
    }

    getHighScore(gameKey) {
      return this.scores[gameKey] || 1000;
    }

    saveScore(gameKey, score) {
      if (score > (this.scores[gameKey] || 0)) {
        this.scores[gameKey] = score;
        localStorage.setItem(`albarracin_arcade_hs_${gameKey}`, score);
        return true; // Nuevo High Score
      }
      return false;
    }
  }

  // ==========================================================
  // 4. JUEGO 01: MOTO RUSH 1984
  // Concepto Comercial: ENTREGA INMEDIATA REAL
  // Showroom Chabás, Chasis/Motor asignado, Llave en mano 24/48h
  // ==========================================================
  class GameMotoRush {
    constructor(ctx, audio, input, onGameOver, setCommercialTicker) {
      this.ctx = ctx;
      this.audio = audio;
      this.input = input;
      this.onGameOver = onGameOver;
      this.setTicker = setCommercialTicker;

      this.reset();
    }

    reset() {
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      this.score = 0;
      this.distance = 0;
      this.speed = 180; // px/s
      this.maxSpeed = 380;
      this.lives = 3;
      this.roadOffset = 0;

      // Moto protagonista
      this.player = {
        x: this.width / 2 - 14,
        y: this.height - 70,
        w: 28,
        h: 46,
        vx: 0
      };

      this.collectibles = [];
      this.obstacles = [];
      this.nextSpawn = 1.0;
      this.spawnTimer = 0;
      this.lastTickTime = 0;
      this.tickerPhrases = [
        "SHOWROOM EN CHABÁS: UNIDADES DISPONIBLES EN STOCK REAL",
        "NÚMERO DE MOTOR Y CHASIS ASIGNADO EN EL ACTO",
        "ENTREGA INMEDIATA: LLAVE EN MANO EN 24/48 HS",
        "SIN PROMESAS EN EL AIRE: SALÍS RODANDO CON PAPELES"
      ];
      this.tickerIdx = 0;
      this.setTicker(this.tickerPhrases[0]);
    }

    update(dt) {
      // Movimiento horizontal
      let moveX = 0;
      if (this.input.keys.left) moveX -= 1;
      if (this.input.keys.right) moveX += 1;

      // Turbo / Aceleración
      let speedMultiplier = 1;
      if (this.input.keys.up || this.input.keys.action) {
        speedMultiplier = 1.5;
        this.score += Math.floor(dt * 30);
      } else if (this.input.keys.down) {
        speedMultiplier = 0.7;
      }

      const currentSpeed = this.speed * speedMultiplier;
      this.player.x += moveX * 220 * dt;

      // Límites de ruta
      const roadLeft = this.width * 0.18;
      const roadRight = this.width * 0.82 - this.player.w;
      if (this.player.x < roadLeft) this.player.x = roadLeft;
      if (this.player.x > roadRight) this.player.x = roadRight;

      // Desplazamiento de carretera
      this.roadOffset = (this.roadOffset + currentSpeed * dt) % 60;
      this.distance += (currentSpeed * dt) / 50;
      this.score += Math.floor(dt * 15 * speedMultiplier);

      // Aumento progresivo de dificultad
      this.speed = Math.min(this.maxSpeed, 180 + this.distance * 0.4);

      // Spawning
      this.spawnTimer += dt;
      if (this.spawnTimer > this.nextSpawn) {
        this.spawnTimer = 0;
        this.nextSpawn = Math.max(0.65, 1.8 - (this.distance * 0.002));

        const laneWidth = (roadRight - roadLeft) / 3;
        const lane = Math.floor(Math.random() * 3);
        const spawnX = roadLeft + lane * laneWidth + laneWidth / 2 - 12;

        if (Math.random() < 0.55) {
          // Elemento de Entrega Real a recolectar
          const types = [
            { type: 'key', name: 'LLAVE EN MANO', pts: 150, color: '#ffd800' },
            { type: 'doc', name: 'PATENTAMIENTO', pts: 120, color: '#39ff14' },
            { type: 'chasis', name: 'MOTOR ASIGNADO', pts: 200, color: '#00e5ff' },
            { type: 'casco', name: 'CASCO OFICIAL', pts: 100, color: '#ff6e00' }
          ];
          const chosen = types[Math.floor(Math.random() * types.length)];
          this.collectibles.push({
            x: spawnX,
            y: -30,
            w: 24,
            h: 24,
            ...chosen
          });
        } else {
          // Obstáculo (Bache o auto demorado sin stock)
          this.obstacles.push({
            x: spawnX - 4,
            y: -40,
            w: 32,
            h: 36,
            type: Math.random() < 0.5 ? 'bache' : 'traffic',
            speed: Math.random() < 0.5 ? 0 : 50
          });
        }
      }

      // Actualizar coleccionables
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.y += currentSpeed * dt;

        // Colisión con la moto
        if (this.checkCollision(this.player, item)) {
          this.score += item.pts;
          this.audio.pickup();
          this.collectibles.splice(i, 1);
          continue;
        }

        if (item.y > this.height + 40) {
          this.collectibles.splice(i, 1);
        }
      }

      // Actualizar obstáculos
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.y += (currentSpeed - obs.speed) * dt;

        if (this.checkCollision(this.player, obs)) {
          this.audio.hit();
          this.lives--;
          this.obstacles.splice(i, 1);

          if (this.lives <= 0) {
            this.audio.gameover();
            this.onGameOver({
              gameKey: 'moto',
              gameTitle: 'MOTO RUSH 1984',
              score: this.score,
              headline: 'Entrega Inmediata Real • Showroom Chabás',
              desc: 'En Albarracín la unidad que comprás está disponible en nuestro showroom de Pellegrini 1320 con número de chasis y motor asignado. Llave en mano en 24/48 hs.',
              whatsappTopic: 'Entrega Inmediata de Motos y Disponibilidad en Showroom'
            });
            return;
          }
          continue;
        }

        if (obs.y > this.height + 40) {
          this.obstacles.splice(i, 1);
        }
      }

      // Rotar ticker
      this.lastTickTime += dt;
      if (this.lastTickTime > 4.5) {
        this.lastTickTime = 0;
        this.tickerIdx = (this.tickerIdx + 1) % this.tickerPhrases.length;
        this.setTicker(this.tickerPhrases[this.tickerIdx]);
      }
    }

    checkCollision(a, b) {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      );
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Fondo verde campo (Ruta 33 hacia Chabás)
      ctx.fillStyle = '#122415';
      ctx.fillRect(0, 0, w, h);

      // Banquina de tierra/pasto
      const roadLeft = w * 0.18;
      const roadRight = w * 0.82;
      const roadWidth = roadRight - roadLeft;

      ctx.fillStyle = '#263428';
      ctx.fillRect(roadLeft - 8, 0, 8, h);
      ctx.fillRect(roadRight, 0, 8, h);

      // Cinta asfáltica oscura
      ctx.fillStyle = '#181b22';
      ctx.fillRect(roadLeft, 0, roadWidth, h);

      // Líneas de carril discontinuas estilo Atari
      ctx.fillStyle = '#ffd800';
      const laneWidth = roadWidth / 3;
      for (let l = 1; l <= 2; l++) {
        const lx = roadLeft + l * laneWidth;
        for (let y = -60 + this.roadOffset; y < h + 60; y += 45) {
          ctx.fillRect(lx - 2, y, 4, 25);
        }
      }

      // Dibujar Coleccionables (Llave, papeles, etc.)
      for (const item of this.collectibles) {
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;

        if (item.type === 'key') {
          // Llave pixel
          ctx.fillRect(item.x + 8, item.y + 2, 8, 8);
          ctx.fillRect(item.x + 10, item.y + 10, 4, 12);
          ctx.fillRect(item.x + 14, item.y + 14, 4, 3);
          ctx.fillRect(item.x + 14, item.y + 19, 4, 3);
        } else if (item.type === 'doc') {
          // Documento con sello
          ctx.fillRect(item.x + 4, item.y + 2, 16, 20);
          ctx.fillStyle = '#080a10';
          ctx.fillRect(item.x + 7, item.y + 6, 10, 2);
          ctx.fillRect(item.x + 7, item.y + 10, 10, 2);
          ctx.fillRect(item.x + 7, item.y + 14, 6, 2);
        } else {
          // Check de motor / chasis
          ctx.fillRect(item.x + 4, item.y + 4, 16, 16);
          ctx.fillStyle = '#080a10';
          ctx.fillRect(item.x + 8, item.y + 8, 8, 8);
        }
        ctx.shadowBlur = 0;
      }

      // Dibujar Obstáculos
      for (const obs of this.obstacles) {
        if (obs.type === 'bache') {
          ctx.fillStyle = '#0a0c10';
          ctx.fillRect(obs.x + 4, obs.y + 8, obs.w - 8, obs.h - 16);
          ctx.strokeStyle = '#ff2a2a';
          ctx.strokeRect(obs.x + 4, obs.y + 8, obs.w - 8, obs.h - 16);
        } else {
          // Auto lento
          ctx.fillStyle = '#3a4460';
          ctx.fillRect(obs.x + 4, obs.y + 2, obs.w - 8, obs.h - 4);
          ctx.fillStyle = '#ff2a2a';
          ctx.fillRect(obs.x + 6, obs.y + obs.h - 8, 6, 4);
          ctx.fillRect(obs.x + obs.w - 12, obs.y + obs.h - 8, 6, 4);
        }
      }

      // Dibujar Moto Jugador (Pixel Art 8-Bit Roja/Blanca Albarracín)
      const p = this.player;
      ctx.save();
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(p.x + 4, p.y + p.h - 6, p.w - 8, 8);

      // Chasis de la moto
      ctx.fillStyle = '#ff2a2a'; // Rojo Albarracín
      ctx.fillRect(p.x + 10, p.y + 6, 8, 30);
      ctx.fillRect(p.x + 6, p.y + 16, 16, 14);

      // Casco / Piloto
      ctx.fillStyle = '#ffd800';
      ctx.fillRect(p.x + 10, p.y + 14, 8, 8);

      // Manubrio
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(p.x + 2, p.y + 10, 24, 4);

      // Ruedas delantera y trasera
      ctx.fillStyle = '#080808';
      ctx.fillRect(p.x + 11, p.y, 6, 8);
      ctx.fillRect(p.x + 11, p.y + 34, 6, 10);

      // Luz frontal
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(p.x + 12, p.y - 2, 4, 3);

      ctx.restore();

      // HUD del juego
      this.drawHUD();
    }

    drawHUD() {
      const ctx = this.ctx;
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';

      // Puntos
      ctx.fillText(`SCORE: ${this.score}`, 16, 22);

      // Distancia
      ctx.fillStyle = '#ffd800';
      ctx.fillText(`${Math.floor(this.distance)} M`, this.width / 2 - 25, 22);

      // Vidas (Motos)
      ctx.fillStyle = '#39ff14';
      let lifeStr = 'VIDAS: ';
      for (let i = 0; i < this.lives; i++) lifeStr += '🏍️';
      ctx.fillText(lifeStr, this.width - 140, 22);
    }
  }

  // ==========================================================
  // 5. JUEGO 02: REPUESTOS INVADERS
  // Concepto Comercial: REPUESTOS 100% GENUINOS
  // Factura oficial A/B, Trazabilidad de fábrica, Sin copias truchas
  // ==========================================================
  class GameRepuestosInvaders {
    constructor(ctx, audio, input, onGameOver, setCommercialTicker) {
      this.ctx = ctx;
      this.audio = audio;
      this.input = input;
      this.onGameOver = onGameOver;
      this.setTicker = setCommercialTicker;

      this.reset();
    }

    reset() {
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      this.score = 0;
      this.combo = 0;
      this.lives = 3;
      this.level = 1;

      // Receptor de repuestos Albarracín
      this.catcher = {
        x: this.width / 2 - 35,
        y: this.height - 40,
        w: 70,
        h: 22
      };

      this.fallingItems = [];
      this.spawnTimer = 0;
      this.spawnInterval = 1.2;
      this.lastTickTime = 0;
      this.tickerPhrases = [
        "SOLO REPUESTOS 100% GENUINOS Y HOMOLOGADOS",
        "FACTURA OFICIAL (A/B) Y TRAZABILIDAD DE FÁBRICA",
        "SIN COPIAS NI PIEZAS DUDOSAS: TU SEGURIDAD NO SE NEGOCIA",
        "DISTRIBUCIÓN DIRECTA DE COMPONENTES DE PRIMERA LÍNEA"
      ];
      this.tickerIdx = 0;
      this.setTicker(this.tickerPhrases[0]);
    }

    update(dt) {
      // Movimiento horizontal del receptor
      let moveX = 0;
      if (this.input.keys.left) moveX -= 1;
      if (this.input.keys.right) moveX += 1;

      this.catcher.x += moveX * 320 * dt;
      if (this.catcher.x < 10) this.catcher.x = 10;
      if (this.catcher.x > this.width - this.catcher.w - 10) {
        this.catcher.x = this.width - this.catcher.w - 10;
      }

      // Spawning de repuestos y copias piratas
      this.spawnTimer += dt;
      if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(0.55, 1.3 - this.level * 0.08);

        const isGenuine = Math.random() < 0.65;
        const spawnX = Math.random() * (this.width - 60) + 30;

        if (isGenuine) {
          const genuineTypes = [
            { name: 'CORREA GATES', code: 'GATES', pts: 150, color: '#00e5ff' },
            { name: 'EMBRAGUE SACHS', code: 'SACHS', pts: 180, color: '#39ff14' },
            { name: 'BATERÍA MOURA', code: 'MOURA', pts: 200, color: '#ffd800' },
            { name: 'FACTURA A/B', code: 'FAC A/B', pts: 250, color: '#ffffff' }
          ];
          const part = genuineTypes[Math.floor(Math.random() * genuineTypes.length)];
          this.fallingItems.push({
            x: spawnX,
            y: -30,
            w: 32,
            h: 30,
            genuine: true,
            speed: 120 + this.level * 18,
            ...part
          });
        } else {
          // Copia dudosa / Trucha
          this.fallingItems.push({
            x: spawnX,
            y: -30,
            w: 32,
            h: 30,
            genuine: false,
            name: 'COPIA DUDOSA',
            code: 'TRUCHO',
            pts: -100,
            color: '#ff2a2a',
            speed: 140 + this.level * 22
          });
        }
      }

      // Caída y colisión
      for (let i = this.fallingItems.length - 1; i >= 0; i--) {
        const item = this.fallingItems[i];
        item.y += item.speed * dt;

        // Captura con la bandeja
        if (
          item.x < this.catcher.x + this.catcher.w &&
          item.x + item.w > this.catcher.x &&
          item.y + item.h > this.catcher.y &&
          item.y < this.catcher.y + this.catcher.h
        ) {
          if (item.genuine) {
            this.combo++;
            const comboBonus = Math.min(this.combo * 20, 200);
            this.score += item.pts + comboBonus;
            this.audio.pickup();
            if (this.combo % 5 === 0) {
              this.level++;
              this.audio.success();
            }
          } else {
            // Atrapó una copia falsa
            this.combo = 0;
            this.lives--;
            this.audio.hit();
            if (this.lives <= 0) {
              this.audio.gameover();
              this.onGameOver({
                gameKey: 'invaders',
                gameTitle: 'REPUESTOS INVADERS',
                score: this.score,
                headline: 'Repuestos 100% Genuinos con Factura Oficial',
                desc: 'Tu seguridad no se negocia. En Albarracín trabajamos únicamente con autopartes y componentes originales con factura oficial (A/B) y trazabilidad comprobable de fábrica.',
                whatsappTopic: 'Cotización de Repuestos Originales y Autopartes Genuinas'
              });
              return;
            }
          }
          this.fallingItems.splice(i, 1);
          continue;
        }

        // Si se escapa por abajo
        if (item.y > this.height + 20) {
          if (item.genuine) {
            // Se le pasó un repuesto genuino
            this.combo = 0;
          }
          this.fallingItems.splice(i, 1);
        }
      }

      // Rotar ticker
      this.lastTickTime += dt;
      if (this.lastTickTime > 4.5) {
        this.lastTickTime = 0;
        this.tickerIdx = (this.tickerIdx + 1) % this.tickerPhrases.length;
        this.setTicker(this.tickerPhrases[this.tickerIdx]);
      }
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Fondo nave de depósito de repuestos estilo Atari
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, w, h);

      // Rejilla de depósito en perspectiva
      ctx.strokeStyle = '#162238';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Dibujar Items que caen
      for (const item of this.fallingItems) {
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = item.genuine ? 10 : 15;

        // Caja de repuesto pixelada
        ctx.fillRect(item.x, item.y, item.w, item.h);

        // Borde interior
        ctx.fillStyle = '#080a10';
        ctx.fillRect(item.x + 3, item.y + 3, item.w - 6, item.h - 6);

        // Etiqueta de marca o advertencia
        ctx.fillStyle = item.color;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(item.code, item.x + 4, item.y + 18);

        ctx.shadowBlur = 0;
      }

      // Dibujar Receptor Albarracín (Bandeja / Carro de Inspección Oficial)
      const c = this.catcher;
      ctx.fillStyle = '#ff2a2a'; // Rojo Albarracín
      ctx.fillRect(c.x, c.y + 6, c.w, c.h - 6);

      // Escáner láser superior verde
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 8;
      ctx.fillRect(c.x + 4, c.y, c.w - 8, 5);
      ctx.shadowBlur = 0;

      // Logotipo en el carro
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('ALBARRACÍN', c.x + 6, c.y + 17);

      // HUD
      this.drawHUD();
    }

    drawHUD() {
      const ctx = this.ctx;
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';

      ctx.fillText(`SCORE: ${this.score}`, 16, 22);

      if (this.combo > 1) {
        ctx.fillStyle = '#ffd800';
        ctx.fillText(`COMBO x${this.combo}`, this.width / 2 - 35, 22);
      }

      ctx.fillStyle = '#39ff14';
      let lifeStr = 'VIDAS: ';
      for (let i = 0; i < this.lives; i++) lifeStr += '❤️';
      ctx.fillText(lifeStr, this.width - 130, 22);
    }
  }

  // ==========================================================
  // 6. JUEGO 03: TALLER HERO
  // Concepto Comercial: TALLER OFICIAL HOMOLOGADO
  // Centro Técnico Vigia & Viesa, Pellegrini 1320, Garantía escrita
  // ==========================================================
  class GameTallerHero {
    constructor(ctx, audio, input, onGameOver, setCommercialTicker) {
      this.ctx = ctx;
      this.audio = audio;
      this.input = input;
      this.onGameOver = onGameOver;
      this.setTicker = setCommercialTicker;

      this.tools = [
        { id: 1, name: 'CALIBRADOR VIGIA', icon: '🎛️', key: 'tool1', keyLabel: '1 / [A]' },
        { id: 2, name: 'ESCÁNER DIAGNÓSTICO', icon: '📟', key: 'tool2', keyLabel: '2 / [B]' },
        { id: 3, name: 'LLAVE DINAMOMÉTRICA', icon: '🔧', key: 'tool3', keyLabel: '3 / [UP]' },
        { id: 4, name: 'KIT CLIMA VIESA', icon: '❄️', key: 'tool4', keyLabel: '4 / [DOWN]' }
      ];

      this.reset();
    }

    reset() {
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      this.score = 0;
      this.round = 1;
      this.lives = 3;
      this.repairsCount = 0;

      this.currentFault = null;
      this.timer = 0;
      this.timeLimit = 4.0;
      this.feedbackText = '';
      this.feedbackColor = '#39ff14';
      this.feedbackTimer = 0;

      this.tickerPhrases = [
        "CENTRO TÉCNICO OFICIAL VIGIA Y VIESA EN CHABÁS",
        "INSTALACIONES PROPIAS EN PELLEGRINI 1320",
        "INSTRUMENTAL DE DIAGNÓSTICO Y MECÁNICOS MATRICULADOS",
        "GARANTÍA ESCRITA EN MANO DE OBRA Y CALIBRACIÓN"
      ];
      this.tickerIdx = 0;
      this.setTicker(this.tickerPhrases[0]);

      this.nextFault();
    }

    nextFault() {
      const faultPool = [
        {
          code: 'ALERTA TEMP. MOTOR',
          desc: 'CALIBRAR SENSOR VIGIA PROTECTOR',
          requiredTool: 1,
          tip: 'Protector de motor Vigia: calibración oficial.'
        },
        {
          code: 'CHECK COMPUTADORA',
          desc: 'CONECTAR ESCÁNER COMPUTARIZADO',
          requiredTool: 2,
          tip: 'Diagnóstico electrónico computarizado.'
        },
        {
          code: 'TORQUE DE TAPA MOTOR',
          desc: 'AJUSTE CON LLAVE DINAMOMÉTRICA',
          requiredTool: 3,
          tip: 'Ajuste a especificación de fábrica.'
        },
        {
          code: 'CABINA ECOLÓGICA',
          desc: 'SERVICE CLIMATIZADOR VIESA',
          requiredTool: 4,
          tip: 'Climatizador ecológico Viesa oficial.'
        }
      ];

      this.currentFault = faultPool[Math.floor(Math.random() * faultPool.length)];
      this.timeLimit = Math.max(1.8, 3.8 - this.round * 0.15);
      this.timer = this.timeLimit;
    }

    update(dt) {
      if (this.feedbackTimer > 0) {
        this.feedbackTimer -= dt;
      }

      this.timer -= dt;

      // Detección de herramientas por teclas / táctil
      let selectedTool = null;
      if (this.input.keys.tool1 || this.input.keys.action) selectedTool = 1;
      else if (this.input.keys.tool2 || this.input.keys.tool) selectedTool = 2;
      else if (this.input.keys.tool3 || this.input.keys.up) selectedTool = 3;
      else if (this.input.keys.tool4 || this.input.keys.down) selectedTool = 4;

      // Limpiar pulsaciones de un disparo
      this.input.keys.tool1 = false;
      this.input.keys.tool2 = false;
      this.input.keys.tool3 = false;
      this.input.keys.tool4 = false;

      if (selectedTool !== null) {
        this.handleToolChoice(selectedTool);
      } else if (this.timer <= 0) {
        // Se acabó el tiempo
        this.audio.hit();
        this.lives--;
        this.feedbackText = '¡TIEMPO AGOTADO!';
        this.feedbackColor = '#ff2a2a';
        this.feedbackTimer = 0.8;

        if (this.lives <= 0) {
          this.audio.gameover();
          this.onGameOver({
            gameKey: 'taller',
            gameTitle: 'TALLER HERO 1984',
            score: this.score,
            headline: 'Taller Oficial Homologado Vigia y Viesa',
            desc: 'En Albarracín somos Centro Técnico Oficial Vigia y Viesa en Pellegrini 1320. Contamos con instrumental de diagnóstico, mecánicos matriculados y garantía escrita en mano de obra.',
            whatsappTopic: 'Turno de Taller y Servicio Oficial Vigia-Viesa'
          });
          return;
        }

        this.nextFault();
      }
    }

    handleToolChoice(toolId) {
      if (toolId === this.currentFault.requiredTool) {
        // Acierto
        this.audio.tool();
        this.repairsCount++;
        const speedBonus = Math.floor((this.timer / this.timeLimit) * 200);
        this.score += 250 + speedBonus;
        this.round++;
        this.feedbackText = `¡REPARADO! +${250 + speedBonus} PTS`;
        this.feedbackColor = '#39ff14';
        this.feedbackTimer = 0.7;
        this.nextFault();
      } else {
        // Error de herramienta
        this.audio.hit();
        this.lives--;
        this.feedbackText = '¡HERRAMIENTA INCORRECTA!';
        this.feedbackColor = '#ff2a2a';
        this.feedbackTimer = 0.8;

        if (this.lives <= 0) {
          this.audio.gameover();
          this.onGameOver({
            gameKey: 'taller',
            gameTitle: 'TALLER HERO 1984',
            score: this.score,
            headline: 'Taller Oficial Homologado Vigia y Viesa',
            desc: 'En Albarracín somos Centro Técnico Oficial Vigia y Viesa en Pellegrini 1320. Contamos con instrumental de diagnóstico, mecánicos matriculados y garantía escrita en mano de obra.',
            whatsappTopic: 'Turno de Taller y Servicio Oficial Vigia-Viesa'
          });
          return;
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Fondo banco de taller en Pellegrini 1320
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, w, h);

      // Pantalla de osciloscopio / diagnóstico técnico
      ctx.fillStyle = '#0f1624';
      ctx.strokeStyle = '#2b3a55';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 40, w - 40, 150);
      ctx.fillRect(20, 40, w - 40, 150);

      // Líneas de grilla de osciloscopio
      ctx.strokeStyle = '#18253b';
      ctx.lineWidth = 1;
      for (let y = 60; y < 180; y += 20) {
        ctx.beginPath();
        ctx.moveTo(25, y);
        ctx.lineTo(w - 25, y);
        ctx.stroke();
      }

      // Placa del Taller
      ctx.fillStyle = '#ffd800';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PELLEGRINI 1320 • CENTRO OFICIAL VIGIA-VIESA', 35, 58);

      // Alerta de Falla
      if (this.currentFault) {
        ctx.fillStyle = '#ff2a2a';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(`[!] ${this.currentFault.code}`, 35, 88);

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(`ACCIÓN: ${this.currentFault.desc}`, 35, 112);

        // Barra de tiempo
        const barWidth = w - 70;
        const pct = Math.max(0, this.timer / this.timeLimit);
        ctx.fillStyle = '#20283a';
        ctx.fillRect(35, 130, barWidth, 12);

        ctx.fillStyle = pct > 0.3 ? '#39ff14' : '#ff2a2a';
        ctx.fillRect(35, 130, barWidth * pct, 12);

        ctx.fillStyle = '#00e5ff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(`TIEMPO RESTANTE: ${this.timer.toFixed(1)}s`, 35, 160);
      }

      // Feedback animado
      if (this.feedbackTimer > 0) {
        ctx.fillStyle = this.feedbackColor;
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(this.feedbackText, w / 2 - 100, 180);
      }

      // Panel de 4 Herramientas Seleccionables
      const toolBoxY = 205;
      const colWidth = (w - 50) / 2;

      this.tools.forEach((tool, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const tx = 25 + col * colWidth;
        const ty = toolBoxY + row * 44;

        ctx.fillStyle = '#141b28';
        ctx.strokeStyle = '#2b3a55';
        ctx.lineWidth = 1;
        ctx.fillRect(tx, ty, colWidth - 8, 38);
        ctx.strokeRect(tx, ty, colWidth - 8, 38);

        ctx.font = '14px sans-serif';
        ctx.fillText(tool.icon, tx + 6, ty + 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(tool.name, tx + 30, ty + 16);

        ctx.fillStyle = '#ffd800';
        ctx.fillText(`Pulsar: ${tool.keyLabel}`, tx + 30, ty + 30);
      });

      // HUD
      this.drawHUD();
    }

    drawHUD() {
      const ctx = this.ctx;
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';

      ctx.fillText(`SCORE: ${this.score}`, 16, 22);
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(`REPARADAS: ${this.repairsCount}`, this.width / 2 - 40, 22);

      ctx.fillStyle = '#39ff14';
      let lifeStr = 'VIDAS: ';
      for (let i = 0; i < this.lives; i++) lifeStr += '🔧';
      ctx.fillText(lifeStr, this.width - 130, 22);
    }
  }

  // ==========================================================
  // 7. JUEGO 04: RUTA ALBARRACÍN
  // Concepto Comercial: ATENCIÓN Y RESPALDO DIRECTO
  // Recorrido regional: Chabás, Casilda, Firmat, Sanford, Arequito, Venado Tuerto
  // ==========================================================
  class GameRutaAlbarracin {
    constructor(ctx, audio, input, onGameOver, setCommercialTicker) {
      this.ctx = ctx;
      this.audio = audio;
      this.input = input;
      this.onGameOver = onGameOver;
      this.setTicker = setCommercialTicker;

      // Las 6 localidades obligatorias
      this.stages = [
        { name: 'CHABÁS', sub: 'SALIDA SHOWROOM PELLEGRINI 1320', bg: '#081420', road: '#151b26' },
        { name: 'CASILDA', sub: 'ZONA URBANA DINÁMICA', bg: '#161226', road: '#1b172b' },
        { name: 'FIRMAT', sub: 'ENTORNO COMERCIAL Y REGIONAL', bg: '#1f1510', road: '#241a14' },
        { name: 'SANFORD', sub: 'PAISAJE ABIERTO Y RURAL', bg: '#0e1e12', road: '#152418' },
        { name: 'AREQUITO', sub: 'PUEBLO TRANQUILO Y CERCANO', bg: '#1c1b12', road: '#242318' },
        { name: 'VENADO TUERTO', sub: 'GRAN CENTRO REGIONAL - FINAL', bg: '#1a0914', road: '#2b1022' }
      ];

      this.reset();
    }

    reset() {
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      this.score = 0;
      this.currentStageIdx = 0;
      this.stageProgress = 0; // 0 a 100
      this.lives = 3;

      this.player = {
        x: 60,
        y: this.height - 75,
        w: 36,
        h: 28,
        vy: 0,
        isJumping: false
      };

      this.gravity = 980;
      this.jumpForce = -420;
      this.groundY = this.height - 75;

      this.collectibles = [];
      this.obstacles = [];
      this.spawnTimer = 0;
      this.stageTransitionTimer = 0;

      this.tickerPhrases = [
        "ATENCIÓN DIRECTA Y RESPALDO REGIONAL EN SANTA FE",
        "SIN CALL CENTERS: RESPUESTA REAL CARA A CARA O POR WHATSAPP",
        "COBERTURA: CHABÁS, CASILDA, FIRMAT, SANFORD, AREQUITO, VENADO TUERTO",
        "ASISTENCIA HUMANA Y CERCANA ANTES, DURANTE Y DESPUÉS"
      ];
      this.tickerIdx = 0;
      this.setTicker(this.tickerPhrases[0]);
    }

    update(dt) {
      const currentStage = this.stages[this.currentStageIdx];

      // Salto con Tecla Arriba / Espacio / Botón A
      if ((this.input.keys.up || this.input.keys.action) && !this.player.isJumping) {
        this.player.vy = this.jumpForce;
        this.player.isJumping = true;
        this.audio.jump();
      }

      // Física de salto
      if (this.player.isJumping) {
        this.player.vy += this.gravity * dt;
        this.player.y += this.player.vy * dt;

        if (this.player.y >= this.groundY) {
          this.player.y = this.groundY;
          this.player.vy = 0;
          this.player.isJumping = false;
        }
      }

      // Progreso del tramo regional
      const roadSpeed = 160;
      this.stageProgress += dt * 7.5; // ~13 segundos por localidad
      this.score += Math.floor(dt * 15);

      // Si completa la localidad actual
      if (this.stageProgress >= 100) {
        this.stageProgress = 0;
        this.currentStageIdx++;
        this.audio.success();

        if (this.currentStageIdx >= this.stages.length) {
          // Completó todas las localidades hasta Venado Tuerto
          this.onGameOver({
            gameKey: 'ruta',
            gameTitle: 'RUTA ALBARRACÍN • META VENADO TUERTO',
            score: this.score + 1000,
            headline: 'Atención Directa y Respaldo Regional',
            desc: '¡Llegaste a Venado Tuerto! Albarracín conecta a toda la región sin call centers ni intermediarios: Chabás, Casilda, Firmat, Sanford, Arequito y Venado Tuerto.',
            whatsappTopic: 'Consulta y Asistencia Regional Directa'
          });
          return;
        }
      }

      // Spawning de obstáculos y asistencias
      this.spawnTimer += dt;
      if (this.spawnTimer > 1.3) {
        this.spawnTimer = 0;
        const isAssistance = Math.random() < 0.6;

        if (isAssistance) {
          // Ícono de Asistencia Humana / WhatsApp / Respaldo
          const assistanceTypes = [
            { name: 'WHATSAPP DIRECTO', pts: 100, color: '#25d366' },
            { name: 'ATENCIÓN CARA A CARA', pts: 150, color: '#ffd800' },
            { name: 'RESPALDO REGIONAL', pts: 200, color: '#00e5ff' }
          ];
          const item = assistanceTypes[Math.floor(Math.random() * assistanceTypes.length)];
          this.collectibles.push({
            x: this.width + 20,
            y: this.groundY - (Math.random() < 0.5 ? 20 : 60),
            w: 22,
            h: 22,
            ...item
          });
        } else {
          // Obstáculo (Bache / Cono de ruta)
          this.obstacles.push({
            x: this.width + 20,
            y: this.groundY + 6,
            w: 24,
            h: 22,
            type: 'cono'
          });
        }
      }

      // Actualizar coleccionables
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.x -= roadSpeed * dt;

        if (this.checkCollision(this.player, item)) {
          this.score += item.pts;
          this.audio.pickup();
          this.collectibles.splice(i, 1);
          continue;
        }

        if (item.x < -30) {
          this.collectibles.splice(i, 1);
        }
      }

      // Actualizar obstáculos
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= roadSpeed * dt;

        if (this.checkCollision(this.player, obs)) {
          this.audio.hit();
          this.lives--;
          this.obstacles.splice(i, 1);

          if (this.lives <= 0) {
            this.audio.gameover();
            this.onGameOver({
              gameKey: 'ruta',
              gameTitle: 'RUTA ALBARRACÍN',
              score: this.score,
              headline: 'Atención Directa y Respaldo Regional',
              desc: 'En Albarracín te atendemos sin call centers ni números impersonales. Brindamos asesoramiento cara a cara en Chabás o por WhatsApp en Casilda, Firmat, Sanford, Arequito y Venado Tuerto.',
              whatsappTopic: 'Atención Personalizada y Consulta de Cobertura Regional'
            });
            return;
          }
          continue;
        }

        if (obs.x < -30) {
          this.obstacles.splice(i, 1);
        }
      }
    }

    checkCollision(a, b) {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      );
    }

    draw() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const currentStage = this.stages[this.currentStageIdx] || this.stages[0];

      // Cielo del tramo
      ctx.fillStyle = currentStage.bg;
      ctx.fillRect(0, 0, w, h);

      // Siluetas de fondo (Parallax simple estilo 8-bit)
      ctx.fillStyle = '#0a1018';
      for (let i = 0; i < w; i += 60) {
        ctx.fillRect(i, h - 140, 45, 65);
      }

      // Cartel de Destino en el fondo
      ctx.fillStyle = '#ffd800';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`TRAMO: ${currentStage.name}`, 20, 48);
      ctx.fillStyle = '#9cb1d4';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(currentStage.sub, 20, 64);

      // Carretera horizontal
      ctx.fillStyle = currentStage.road;
      ctx.fillRect(0, this.groundY + 28, w, h - (this.groundY + 28));

      // Líneas blancas divisorias de carril
      ctx.fillStyle = '#ffffff';
      for (let x = 0; x < w; x += 36) {
        ctx.fillRect(x, this.groundY + 38, 20, 3);
      }

      // Coleccionables
      for (const item of this.collectibles) {
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#080a10';
        ctx.fillRect(item.x + 3, item.y + 3, item.w - 6, item.h - 6);
        ctx.shadowBlur = 0;
      }

      // Obstáculos (Conos de advertencia en ruta)
      for (const obs of this.obstacles) {
        ctx.fillStyle = '#ff6e00';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.lineTo(obs.x, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + 5, obs.y + 10, obs.w - 10, 3);
      }

      // Moto Jugador Lateral Albarracín
      const p = this.player;
      ctx.save();

      // Ruedas
      ctx.fillStyle = '#080808';
      ctx.beginPath();
      ctx.arc(p.x + 6, p.y + p.h - 4, 6, 0, Math.PI * 2);
      ctx.arc(p.x + p.w - 6, p.y + p.h - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Chasis rojo Albarracín
      ctx.fillStyle = '#ff2a2a';
      ctx.fillRect(p.x + 8, p.y + p.h - 14, p.w - 14, 8);

      // Conductor y Casco
      ctx.fillStyle = '#ffd800';
      ctx.fillRect(p.x + 14, p.y + 2, 8, 8);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x + 12, p.y + 10, 12, 10);

      // Manillar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(p.x + 22, p.y + 8, 4, 8);

      ctx.restore();

      // HUD
      this.drawHUD();
    }

    drawHUD() {
      const ctx = this.ctx;
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';

      ctx.fillText(`SCORE: ${this.score}`, 16, 22);

      // Barra de progreso regional
      const barW = 100;
      ctx.fillStyle = '#1c2436';
      ctx.fillRect(this.width / 2 - 50, 12, barW, 10);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(this.width / 2 - 50, 12, barW * (this.stageProgress / 100), 10);

      ctx.fillStyle = '#39ff14';
      let lifeStr = 'VIDAS: ';
      for (let i = 0; i < this.lives; i++) lifeStr += '🏍️';
      ctx.fillText(lifeStr, this.width - 130, 22);
    }
  }

  // ==========================================================
  // 8. CONTROLADOR CENTRAL: ARCADE MANAGER
  // ==========================================================
  class ArcadeManager {
    constructor() {
      this.canvas = document.getElementById('arcadeCanvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.audio = new ArcadeAudio();
      this.input = new ArcadeInput();
      this.scoreManager = new ArcadeScoreManager();

      this.currentGameKey = 'moto';
      this.activeGame = null;
      this.state = 'ATTRACT'; // ATTRACT, PLAYING, GAMEOVER, PAUSED
      this.lastTime = 0;

      this.setupCanvas();
      this.setupUI();
      this.setupClubAlbarracinIntegration();
      this.switchGame('moto');

      // Loop principal con delta-time y pausa en pestaña oculta
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);

      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'PLAYING') {
          this.state = 'PAUSED';
        }
      });
    }

    setupCanvas() {
      // Resolución nativa 480x360 nítida pixel-art
      this.canvas.width = 480;
      this.canvas.height = 360;
    }

    setupUI() {
      // Selector de Cartuchos
      const cartridgeCards = document.querySelectorAll('.game-cartridge-card');
      cartridgeCards.forEach((card) => {
        card.addEventListener('click', () => {
          const gameKey = card.dataset.game;
          this.audio.coin();
          this.switchGame(gameKey);
        });
      });

      // Botón Mute Sound
      const muteBtn = document.getElementById('arcade-sound-toggle');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          const isMuted = this.audio.toggleMute();
          muteBtn.classList.toggle('active', !isMuted);
          muteBtn.innerHTML = isMuted ? '🔇 MUTE' : '🔊 SOUND';
        });
      }

      // Botón Start General
      const startBtn = document.getElementById('btn-arcade-start');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (this.state === 'ATTRACT' || this.state === 'GAMEOVER') {
            this.startGame();
          } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
          }
        });
      }

      // Botones de Pantalla Final Modal
      const restartBtn = document.getElementById('btn-gameover-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => this.startGame());
      }

      const menuBtn = document.getElementById('btn-gameover-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', () => this.showMenu());
      }
    }

    setupClubAlbarracinIntegration() {
      try {
        const clubUserStr = localStorage.getItem('albarracin_loyalty_user');
        const clubBadgeEl = document.getElementById('arcade-club-player');
        if (clubUserStr && clubBadgeEl) {
          const user = JSON.parse(clubUserStr);
          if (user && user.name) {
            clubBadgeEl.textContent = `PLAYER: ${user.name.toUpperCase()} (CLUB)`;
            return;
          }
        }
        if (clubBadgeEl) {
          clubBadgeEl.textContent = 'PLAYER: 1P (INVITADO)';
        }
      } catch (e) {}
    }

    setCommercialTicker(text) {
      const tickerEl = document.getElementById('arcade-ticker-text');
      if (tickerEl) {
        tickerEl.textContent = text;
      }
    }

    switchGame(gameKey) {
      this.currentGameKey = gameKey;

      // Actualizar UI activa en cartuchos
      document.querySelectorAll('.game-cartridge-card').forEach((c) => {
        c.classList.toggle('active', c.dataset.game === gameKey);
      });

      // Actualizar High Score en HUD
      const hs = this.scoreManager.getHighScore(gameKey);
      const hsEl = document.getElementById('arcade-hud-hs');
      if (hsEl) hsEl.textContent = hs;

      this.startGame();
    }

    startGame() {
      this.audio.startFanfare();

      // Ocultar modal de GameOver si estuviera abierto
      const modal = document.getElementById('arcade-gameover-modal');
      if (modal) modal.style.display = 'none';

      const tickerCb = (txt) => this.setCommercialTicker(txt);
      const overCb = (res) => this.handleGameOver(res);

      switch (this.currentGameKey) {
        case 'moto':
          this.activeGame = new GameMotoRush(this.ctx, this.audio, this.input, overCb, tickerCb);
          break;
        case 'invaders':
          this.activeGame = new GameRepuestosInvaders(this.ctx, this.audio, this.input, overCb, tickerCb);
          break;
        case 'taller':
          this.activeGame = new GameTallerHero(this.ctx, this.audio, this.input, overCb, tickerCb);
          break;
        case 'ruta':
          this.activeGame = new GameRutaAlbarracin(this.ctx, this.audio, this.input, overCb, tickerCb);
          break;
      }

      this.state = 'PLAYING';
    }

    showMenu() {
      const modal = document.getElementById('arcade-gameover-modal');
      if (modal) modal.style.display = 'none';
      this.state = 'ATTRACT';
    }

    handleGameOver(res) {
      this.state = 'GAMEOVER';

      const isNewRecord = this.scoreManager.saveScore(res.gameKey, res.score);

      // Actualizar modal con la tarjeta de valor comercial real
      const modal = document.getElementById('arcade-gameover-modal');
      const scoreVal = document.getElementById('gameover-score-value');
      const hsVal = document.getElementById('gameover-hs-value');
      const titleEl = document.getElementById('gameover-game-title');
      const headlineEl = document.getElementById('gameover-comm-headline');
      const descEl = document.getElementById('gameover-comm-desc');
      const waBtn = document.getElementById('btn-gameover-whatsapp');

      if (scoreVal) scoreVal.textContent = res.score;
      if (hsVal) hsVal.textContent = this.scoreManager.getHighScore(res.gameKey);
      if (titleEl) titleEl.textContent = isNewRecord ? `★ NUEVO RÉCORD: ${res.score} ★` : 'GAME OVER';
      if (headlineEl) headlineEl.textContent = res.headline;
      if (descEl) descEl.textContent = res.desc;

      if (waBtn) {
        const text = encodeURIComponent(
          `Hola Albarracín! Estuve jugando al Retro Arcade (${res.gameTitle}) y me interesa consultar por: ${res.whatsappTopic}. ¿Me podrían asesorar?`
        );
        waBtn.href = `https://wa.me/5493464685338?text=${text}`;
      }

      if (modal) modal.style.display = 'flex';
    }

    loop(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      if (this.state === 'PLAYING' && this.activeGame) {
        this.activeGame.update(dt);
        this.activeGame.draw();
      } else if (this.state === 'ATTRACT') {
        this.drawAttractScreen();
      }

      requestAnimationFrame(this.loop);
    }

    drawAttractScreen() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, w, h);

      // Letras Neón
      ctx.fillStyle = '#ff2a2a';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ALBARRACÍN RETRO ARCADE', w / 2, 80);

      ctx.fillStyle = '#ffd800';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('EDICIÓN CLÁSICA 1984', w / 2, 105);

      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('ELEGÍ UN CARTUCHO O TOCÁ START', w / 2, 160);

      // Titileo clásico INSERT COIN
      if (Math.floor(Date.now() / 600) % 2 === 0) {
        ctx.fillStyle = '#39ff14';
        ctx.fillText('► INSERT COIN — PRESS START ◄', w / 2, 210);
      }

      ctx.fillStyle = '#8395b8';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('1. MOTO RUSH   2. REPUESTOS INVADERS', w / 2, 270);
      ctx.fillText('3. TALLER HERO 4. RUTA ALBARRACÍN', w / 2, 290);

      ctx.textAlign = 'left';
    }
  }

  // Inicialización al cargar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.arcadeApp = new ArcadeManager();
    });
  } else {
    window.arcadeApp = new ArcadeManager();
  }
})();
