// src/utils/canvas.ts

/**
 * Canvas 렌더링 헬퍼 클래스
 */
export class CanvasHelper {
  constructor(private ctx: CanvasRenderingContext2D) {}

  /**
   * Canvas 전체 지우기
   */
  clear(): void {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * 배경색으로 채우기
   */
  fillBackground(color: string): void {
    const canvas = this.ctx.canvas;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * 이모지 그리기
   */
  drawEmoji(emoji: string, x: number, y: number, size: number): void {
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x, y);
  }

  /**
   * 원 그리기
   */
  drawCircle(x: number, y: number, radius: number, color: string, fill: boolean = true): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * 사각형 그리기
   */
  drawRect(x: number, y: number, width: number, height: number, color: string, fill: boolean = true): void {
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * 둥근 사각형 그리기
   */
  drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string, fill: boolean = true): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * 선 그리기
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * 텍스트 그리기
   */
  drawText(
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: CanvasTextAlign = 'center',
    baseline: CanvasTextBaseline = 'middle'
  ): void {
    this.ctx.font = `${size}px Arial`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  /**
   * 외곽선 있는 텍스트 그리기
   */
  drawStrokedText(
    text: string,
    x: number,
    y: number,
    size: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number = 2
  ): void {
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 외곽선
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.strokeText(text, x, y);
    
    // 채우기
    this.ctx.fillStyle = fillColor;
    this.ctx.fillText(text, x, y);
  }

  /**
   * 그라데이션 생성 (선형)
   */
  createLinearGradient(x1: number, y1: number, x2: number, y2: number, colors: string[]): CanvasGradient {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  }

  /**
   * 그라데이션 생성 (원형)
   */
  createRadialGradient(
    x: number,
    y: number,
    innerRadius: number,
    outerRadius: number,
    colors: string[]
  ): CanvasGradient {
    const gradient = this.ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  }

  /**
   * 다각형 그리기
   */
  drawPolygon(points: { x: number; y: number }[], color: string, fill: boolean = true): void {
    if (points.length < 3) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * 별 그리기
   */
  drawStar(x: number, y: number, outerRadius: number, innerRadius: number, points: number, color: string): void {
    const angleStep = (Math.PI * 2) / (points * 2);
    
    this.ctx.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * angleStep - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * 화살표 그리기
   */
  drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 2): void {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // 선
    this.drawLine(x1, y1, x2, y2, color, width);
    
    // 화살표 머리
    this.ctx.beginPath();
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  /**
   * 파티클 효과 (작은 원들)
   */
  createParticles(x: number, y: number, color: string, count: number = 10): Particle[] {
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        life: 1.0
      });
    }
    
    return particles;
  }

  /**
   * 파티클 업데이트 및 렌더링
   */
  updateAndDrawParticles(particles: Particle[]): Particle[] {
    return particles
      .map(p => {
        // 업데이트
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // 중력
        p.life -= 0.02;
        
        // 렌더링
        this.ctx.globalAlpha = p.life;
        this.drawCircle(p.x, p.y, p.radius, p.color);
        this.ctx.globalAlpha = 1.0;
        
        return p;
      })
      .filter(p => p.life > 0);
  }

  /**
   * Canvas 상태 저장
   */
  save(): void {
    this.ctx.save();
  }

  /**
   * Canvas 상태 복원
   */
  restore(): void {
    this.ctx.restore();
  }

  /**
   * Canvas 회전
   */
  rotate(angle: number, centerX: number, centerY: number): void {
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.ctx.translate(-centerX, -centerY);
  }
}

/**
 * 파티클 타입
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number; // 0-1
}

/**
 * 두 점 사이의 거리 계산
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 선과 원의 충돌 감지
 */
export function lineIntersectsCircle(
  lineX1: number,
  lineY1: number,
  lineX2: number,
  lineY2: number,
  circleX: number,
  circleY: number,
  radius: number
): boolean {
  const dx = lineX2 - lineX1;
  const dy = lineY2 - lineY1;
  const fx = lineX1 - circleX;
  const fy = lineY1 - circleY;
  
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = (fx * fx + fy * fy) - radius * radius;
  
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) return false;
  
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
  
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

/**
 * 두 원의 충돌 감지
 */
export function circlesIntersect(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  return distance(x1, y1, x2, y2) < r1 + r2;
}

/**
 * 점이 사각형 안에 있는지 확인
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 점이 원 안에 있는지 확인
 */
export function pointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  return distance(px, py, cx, cy) <= radius;
}
