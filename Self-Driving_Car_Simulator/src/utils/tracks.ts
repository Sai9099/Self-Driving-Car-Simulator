import { Track, Wall, Checkpoint, Vector2 } from '../types';

export function createSimpleTrack(): Track {
  const walls: Wall[] = [
    // Outer walls
    { start: { x: 50, y: 50 }, end: { x: 750, y: 50 } },
    { start: { x: 750, y: 50 }, end: { x: 750, y: 550 } },
    { start: { x: 750, y: 550 }, end: { x: 50, y: 550 } },
    { start: { x: 50, y: 550 }, end: { x: 50, y: 50 } },
    
    // Inner walls
    { start: { x: 150, y: 150 }, end: { x: 650, y: 150 } },
    { start: { x: 650, y: 150 }, end: { x: 650, y: 450 } },
    { start: { x: 650, y: 450 }, end: { x: 150, y: 450 } },
    { start: { x: 150, y: 450 }, end: { x: 150, y: 150 } }
  ];

  const checkpoints: Checkpoint[] = [
    { id: 0, start: { x: 100, y: 100 }, end: { x: 100, y: 200 }, passed: false },
    { id: 1, start: { x: 300, y: 100 }, end: { x: 300, y: 150 }, passed: false },
    { id: 2, start: { x: 500, y: 100 }, end: { x: 500, y: 150 }, passed: false },
    { id: 3, start: { x: 700, y: 200 }, end: { x: 650, y: 200 }, passed: false },
    { id: 4, start: { x: 700, y: 400 }, end: { x: 650, y: 400 }, passed: false },
    { id: 5, start: { x: 500, y: 500 }, end: { x: 500, y: 450 }, passed: false },
    { id: 6, start: { x: 300, y: 500 }, end: { x: 300, y: 450 }, passed: false },
    { id: 7, start: { x: 100, y: 400 }, end: { x: 150, y: 400 }, passed: false }
  ];

  return {
    id: 'simple',
    name: 'Simple Oval',
    walls,
    checkpoints,
    startPosition: { x: 100, y: 300 },
    startAngle: 0,
    width: 800,
    height: 600
  };
}

export function createComplexTrack(): Track {
  const walls: Wall[] = [
    // Outer boundary
    { start: { x: 50, y: 50 }, end: { x: 750, y: 50 } },
    { start: { x: 750, y: 50 }, end: { x: 750, y: 300 } },
    { start: { x: 750, y: 300 }, end: { x: 600, y: 300 } },
    { start: { x: 600, y: 300 }, end: { x: 600, y: 450 } },
    { start: { x: 600, y: 450 }, end: { x: 750, y: 450 } },
    { start: { x: 750, y: 450 }, end: { x: 750, y: 550 } },
    { start: { x: 750, y: 550 }, end: { x: 50, y: 550 } },
    { start: { x: 50, y: 550 }, end: { x: 50, y: 450 } },
    { start: { x: 50, y: 450 }, end: { x: 200, y: 450 } },
    { start: { x: 200, y: 450 }, end: { x: 200, y: 300 } },
    { start: { x: 200, y: 300 }, end: { x: 50, y: 300 } },
    { start: { x: 50, y: 300 }, end: { x: 50, y: 50 } },

    // Inner obstacles
    { start: { x: 150, y: 150 }, end: { x: 300, y: 150 } },
    { start: { x: 300, y: 150 }, end: { x: 300, y: 200 } },
    { start: { x: 300, y: 200 }, end: { x: 150, y: 200 } },
    { start: { x: 150, y: 200 }, end: { x: 150, y: 150 } },

    { start: { x: 500, y: 150 }, end: { x: 650, y: 150 } },
    { start: { x: 650, y: 150 }, end: { x: 650, y: 200 } },
    { start: { x: 650, y: 200 }, end: { x: 500, y: 200 } },
    { start: { x: 500, y: 200 }, end: { x: 500, y: 150 } },

    { start: { x: 350, y: 350 }, end: { x: 450, y: 350 } },
    { start: { x: 450, y: 350 }, end: { x: 450, y: 400 } },
    { start: { x: 450, y: 400 }, end: { x: 350, y: 400 } },
    { start: { x: 350, y: 400 }, end: { x: 350, y: 350 } }
  ];

  const checkpoints: Checkpoint[] = [
    { id: 0, start: { x: 125, y: 100 }, end: { x: 125, y: 150 }, passed: false },
    { id: 1, start: { x: 400, y: 100 }, end: { x: 400, y: 150 }, passed: false },
    { id: 2, start: { x: 675, y: 100 }, end: { x: 675, y: 150 }, passed: false },
    { id: 3, start: { x: 700, y: 225 }, end: { x: 650, y: 225 }, passed: false },
    { id: 4, start: { x: 675, y: 375 }, end: { x: 675, y: 425 }, passed: false },
    { id: 5, start: { x: 700, y: 500 }, end: { x: 650, y: 500 }, passed: false },
    { id: 6, start: { x: 400, y: 500 }, end: { x: 400, y: 450 }, passed: false },
    { id: 7, start: { x: 125, y: 500 }, end: { x: 125, y: 450 }, passed: false },
    { id: 8, start: { x: 100, y: 375 }, end: { x: 150, y: 375 }, passed: false },
    { id: 9, start: { x: 125, y: 225 }, end: { x: 125, y: 275 }, passed: false }
  ];

  return {
    id: 'complex',
    name: 'Complex Circuit',
    walls,
    checkpoints,
    startPosition: { x: 100, y: 125 },
    startAngle: 0,
    width: 800,
    height: 600
  };
}

export function createFigureEightTrack(): Track {
  const walls: Wall[] = [];
  const checkpoints: Checkpoint[] = [];

  // Create figure-8 track using curves
  const centerX = 400;
  const centerY = 300;
  const radius = 150;
  const trackWidth = 50;

  // Generate curved walls for figure-8
  for (let i = 0; i < 64; i++) {
    const angle1 = (i / 32) * Math.PI;
    const angle2 = ((i + 1) / 32) * Math.PI;

    // Upper loop
    const x1 = centerX + Math.cos(angle1) * radius;
    const y1 = centerY - 100 + Math.sin(angle1) * radius * 0.6;
    const x2 = centerX + Math.cos(angle2) * radius;
    const y2 = centerY - 100 + Math.sin(angle2) * radius * 0.6;

    // Outer wall
    walls.push({
      start: { x: x1 + Math.cos(angle1 + Math.PI/2) * trackWidth, y: y1 + Math.sin(angle1 + Math.PI/2) * trackWidth },
      end: { x: x2 + Math.cos(angle2 + Math.PI/2) * trackWidth, y: y2 + Math.sin(angle2 + Math.PI/2) * trackWidth }
    });

    // Inner wall
    walls.push({
      start: { x: x1 - Math.cos(angle1 + Math.PI/2) * trackWidth, y: y1 - Math.sin(angle1 + Math.PI/2) * trackWidth },
      end: { x: x2 - Math.cos(angle2 + Math.PI/2) * trackWidth, y: y2 - Math.sin(angle2 + Math.PI/2) * trackWidth }
    });

    // Lower loop
    const x3 = centerX - Math.cos(angle1) * radius;
    const y3 = centerY + 100 - Math.sin(angle1) * radius * 0.6;
    const x4 = centerX - Math.cos(angle2) * radius;
    const y4 = centerY + 100 - Math.sin(angle2) * radius * 0.6;

    // Outer wall
    walls.push({
      start: { x: x3 + Math.cos(angle1 + Math.PI/2) * trackWidth, y: y3 + Math.sin(angle1 + Math.PI/2) * trackWidth },
      end: { x: x4 + Math.cos(angle2 + Math.PI/2) * trackWidth, y: y4 + Math.sin(angle2 + Math.PI/2) * trackWidth }
    });

    // Inner wall
    walls.push({
      start: { x: x3 - Math.cos(angle1 + Math.PI/2) * trackWidth, y: y3 - Math.sin(angle1 + Math.PI/2) * trackWidth },
      end: { x: x4 - Math.cos(angle2 + Math.PI/2) * trackWidth, y: y4 - Math.sin(angle2 + Math.PI/2) * trackWidth }
    });
  }

  // Add checkpoints
  for (let i = 0; i < 8; i++) {
    const angle = (i / 4) * Math.PI;
    const x = centerX + Math.cos(angle) * radius * 0.8;
    const y = centerY - 100 + Math.sin(angle) * radius * 0.6 * 0.8;
    
    checkpoints.push({
      id: i,
      start: { x: x - 10, y: y - 10 },
      end: { x: x + 10, y: y + 10 },
      passed: false
    });
  }

  return {
    id: 'figure8',
    name: 'Figure Eight',
    walls,
    checkpoints,
    startPosition: { x: centerX + radius * 0.8, y: centerY - 100 },
    startAngle: 0,
    width: 800,
    height: 600
  };
}

export const AVAILABLE_TRACKS = [
  createSimpleTrack(),
  createComplexTrack(),
  createFigureEightTrack()
];