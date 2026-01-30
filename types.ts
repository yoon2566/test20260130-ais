export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  width: number;
  height: number;
  color: string;
  vx: number;
  vy: number;
  hp: number;
}

export interface Player extends Entity {
  score: number;
}

export interface Bullet extends Entity {
  active: boolean;
}

export interface Enemy extends Entity {
  active: boolean;
  type: 'basic' | 'fast' | 'tank';
}

export interface Particle extends Position {
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface AIAnalysis {
  rank: string;
  message: string;
}
