import { DieState, DieValue } from '../../types/game';

export interface CubeAngles {
  x: number;
  y: number;
}

// Maps target die face 1-6 to exact 3D rotation angles
export const FACE_ROTATIONS: Record<DieValue, CubeAngles> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: -90, y: 0 },
  5: { x: 90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 }
};

export class Dice3DComponent {
  private currentRotations: CubeAngles[] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ];

  /**
   * Generates HTML for the 5-slot tray.
   * Dice are ALWAYS rendered so they are visible right from the start,
   * never popping out of nowhere on the first roll!
   */
  public renderTrayHTML(dice: DieState[], rollCount: number): string {
    return `
      <div class="dice-tray-container" id="dice-tray-container">
        ${dice.map((d, i) => {
          const heldClass = d.held ? 'held' : '';
          const unrolledClass = rollCount === 0 ? 'ready-to-roll' : '';
          const targetRot = FACE_ROTATIONS[d.value] || { x: 0, y: 0 };
          const rot = this.currentRotations[i] || targetRot;

          return `
            <div class="tray-slot has-die">
              <div class="die-scene ${heldClass} ${unrolledClass}" data-index="${i}" title="${rollCount > 0 ? 'Tap to hold die' : 'Roll to play'}">
                <div class="die-cube" id="die-cube-${i}" style="transform: rotateX(${rot.x}deg) rotateY(${rot.y}deg);">
                  ${this.renderCubeFacesHTML()}
                </div>
                <div class="die-shadow"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private renderCubeFacesHTML(): string {
    return `
      <div class="cube-face face-1">
        <span class="die-pip"></span>
      </div>
      <div class="cube-face face-2">
        <span class="die-pip"></span>
        <span class="die-pip"></span>
      </div>
      <div class="cube-face face-3">
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
      </div>
      <div class="cube-face face-4">
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
      </div>
      <div class="cube-face face-5">
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
      </div>
      <div class="cube-face face-6">
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
        <span class="die-pip"></span>
      </div>
    `;
  }

  /**
   * Performs an authentic 3D physics tumbling animation for each rolled die.
   * Multi-axis revolutions (rotateX, rotateY, rotateZ) + parabolic arc toss + squash-impact bounce!
   */
  public animateRoll(
    container: HTMLElement,
    rolledIndices: number[],
    newValues: DieValue[],
    onComplete: () => void
  ): void {
    let animationsCompleted = 0;
    const totalToAnimate = rolledIndices.length;

    if (totalToAnimate === 0) {
      onComplete();
      return;
    }

    rolledIndices.forEach((idx, orderIdx) => {
      const scene = container.querySelector(`.die-scene[data-index="${idx}"]`);
      const cube = container.querySelector(`#die-cube-${idx}`) as HTMLElement;
      const targetVal = newValues[idx] || 1;
      const targetAngle = FACE_ROTATIONS[targetVal] || { x: 0, y: 0 };

      if (!scene || !cube) {
        animationsCompleted++;
        if (animationsCompleted >= totalToAnimate) onComplete();
        return;
      }

      scene.classList.add('is-rolling');

      // Random multi-axis revolutions (between 2 and 3 full 360 spins)
      const extraSpinsX = (Math.floor(Math.random() * 2) + 2) * 360;
      const extraSpinsY = (Math.floor(Math.random() * 2) + 2) * 360;
      const tiltZ = (Math.random() - 0.5) * 50;

      const startRot = this.currentRotations[idx] || { x: 0, y: 0 };
      const finalX = targetAngle.x + extraSpinsX;
      const finalY = targetAngle.y + extraSpinsY;

      // Slight stagger per die for natural physics chaos
      const staggerDelay = orderIdx * 25;

      setTimeout(() => {
        const anim = cube.animate([
          {
            transform: `translateY(0px) rotateX(${startRot.x}deg) rotateY(${startRot.y}deg) rotateZ(0deg) scale(1)`,
            offset: 0
          },
          {
            transform: `translateY(-56px) rotateX(${startRot.x + extraSpinsX * 0.35}deg) rotateY(${startRot.y + extraSpinsY * 0.4}deg) rotateZ(${tiltZ}deg) scale(1.18)`,
            offset: 0.32,
            easing: 'ease-out'
          },
          {
            transform: `translateY(-22px) rotateX(${startRot.x + extraSpinsX * 0.7}deg) rotateY(${startRot.y + extraSpinsY * 0.75}deg) rotateZ(${-tiltZ * 0.6}deg) scale(1.08)`,
            offset: 0.65,
            easing: 'ease-in'
          },
          {
            transform: `translateY(4px) rotateX(${finalX}deg) rotateY(${finalY}deg) rotateZ(0deg) scale3d(1.14, 0.86, 1.05)`,
            offset: 0.86,
            easing: 'ease-out'
          },
          {
            transform: `translateY(-8px) rotateX(${finalX}deg) rotateY(${finalY}deg) rotateZ(0deg) scale(1.02)`,
            offset: 0.94,
            easing: 'ease-in'
          },
          {
            transform: `translateY(0px) rotateX(${finalX}deg) rotateY(${finalY}deg) rotateZ(0deg) scale(1)`,
            offset: 1
          }
        ], {
          duration: 720,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards'
        });

        anim.onfinish = () => {
          // Normalize stored angles to avoid runaway values
          this.currentRotations[idx] = { x: targetAngle.x, y: targetAngle.y };
          cube.style.transform = `rotateX(${targetAngle.x}deg) rotateY(${targetAngle.y}deg)`;
          scene.classList.remove('is-rolling');

          animationsCompleted++;
          if (animationsCompleted >= totalToAnimate) {
            onComplete();
          }
        };
      }, staggerDelay);
    });
  }
}
