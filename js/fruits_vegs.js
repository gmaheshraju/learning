function drawFruitsVegs(canvas, type) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 120, 110);

  switch (type) {

    // ===================== FRUITS =====================

    case 'APPLE': {
      // Main red body
      c.beginPath();
      c.arc(60, 60, 32, 0, Math.PI * 2);
      c.fillStyle = '#E53935';
      c.fill();
      // Slight indent at top
      c.beginPath();
      c.arc(60, 30, 10, 0, Math.PI, false);
      c.fillStyle = '#E53935';
      c.fill();
      // Brown stem
      c.beginPath();
      c.moveTo(58, 28);
      c.lineTo(56, 16);
      c.lineTo(60, 16);
      c.lineTo(62, 28);
      c.fillStyle = '#5D4037';
      c.fill();
      // Green leaf
      c.beginPath();
      c.ellipse(68, 20, 10, 5, Math.PI / 6, 0, Math.PI * 2);
      c.fillStyle = '#43A047';
      c.fill();
      // White shine
      c.beginPath();
      c.arc(48, 48, 6, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.fill();
      break;
    }

    case 'BANANA': {
      // Banana body - curved shape
      c.beginPath();
      c.moveTo(30, 70);
      c.quadraticCurveTo(25, 30, 55, 20);
      c.quadraticCurveTo(75, 15, 90, 25);
      c.quadraticCurveTo(95, 30, 92, 35);
      c.quadraticCurveTo(75, 28, 55, 35);
      c.quadraticCurveTo(35, 45, 35, 72);
      c.closePath();
      c.fillStyle = '#FFD600';
      c.fill();
      c.strokeStyle = '#F9A825';
      c.lineWidth = 1.5;
      c.stroke();
      // Brown tip
      c.beginPath();
      c.arc(32, 72, 3, 0, Math.PI * 2);
      c.fillStyle = '#795548';
      c.fill();
      // Shine
      c.beginPath();
      c.moveTo(50, 30);
      c.quadraticCurveTo(60, 25, 75, 25);
      c.strokeStyle = 'rgba(255,255,255,0.4)';
      c.lineWidth = 3;
      c.stroke();
      break;
    }

    case 'ORANGE_FRUIT': {
      // Main orange body
      c.beginPath();
      c.arc(60, 58, 32, 0, Math.PI * 2);
      c.fillStyle = '#FF9800';
      c.fill();
      // Tiny dots texture
      c.fillStyle = '#FB8C00';
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 25;
        c.beginPath();
        c.arc(60 + Math.cos(angle) * r, 58 + Math.sin(angle) * r, 1, 0, Math.PI * 2);
        c.fill();
      }
      // Small green leaf
      c.beginPath();
      c.ellipse(65, 24, 8, 4, Math.PI / 5, 0, Math.PI * 2);
      c.fillStyle = '#43A047';
      c.fill();
      // Tiny stem
      c.beginPath();
      c.moveTo(59, 26);
      c.lineTo(60, 20);
      c.lineTo(62, 26);
      c.fillStyle = '#5D4037';
      c.fill();
      // White shine
      c.beginPath();
      c.arc(48, 48, 6, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fill();
      break;
    }

    case 'GRAPES': {
      // Green stem
      c.beginPath();
      c.moveTo(58, 10);
      c.lineTo(60, 25);
      c.lineTo(62, 10);
      c.fillStyle = '#388E3C';
      c.fill();
      // Cluster of purple circles
      const grapePositions = [
        [50, 35], [60, 32], [70, 35],
        [45, 48], [55, 45], [65, 45], [75, 48],
        [48, 60], [58, 58], [68, 60],
        [53, 72], [63, 70],
        [58, 82]
      ];
      grapePositions.forEach(([gx, gy]) => {
        c.beginPath();
        c.arc(gx, gy, 8, 0, Math.PI * 2);
        c.fillStyle = '#7B1FA2';
        c.fill();
        // Tiny shine on each grape
        c.beginPath();
        c.arc(gx - 2, gy - 3, 2, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,0.4)';
        c.fill();
      });
      break;
    }

    case 'WATERMELON': {
      // Green rind (outer half circle)
      c.beginPath();
      c.arc(60, 70, 40, Math.PI, 0);
      c.lineTo(100, 70);
      c.lineTo(20, 70);
      c.closePath();
      c.fillStyle = '#388E3C';
      c.fill();
      // Lighter green stripe
      c.beginPath();
      c.arc(60, 70, 35, Math.PI, 0);
      c.lineTo(95, 70);
      c.lineTo(25, 70);
      c.closePath();
      c.fillStyle = '#66BB6A';
      c.fill();
      // Red inside
      c.beginPath();
      c.arc(60, 70, 30, Math.PI, 0);
      c.lineTo(90, 70);
      c.lineTo(30, 70);
      c.closePath();
      c.fillStyle = '#E53935';
      c.fill();
      // Black seeds
      const seedPositions = [[45, 58], [55, 50], [65, 50], [75, 58], [50, 65], [60, 60], [70, 65]];
      c.fillStyle = '#212121';
      seedPositions.forEach(([sx, sy]) => {
        c.beginPath();
        c.ellipse(sx, sy, 2, 3.5, 0, 0, Math.PI * 2);
        c.fill();
      });
      break;
    }

    case 'STRAWBERRY': {
      // Red strawberry body (rounded triangle)
      c.beginPath();
      c.moveTo(60, 90);
      c.quadraticCurveTo(25, 50, 35, 30);
      c.quadraticCurveTo(45, 20, 60, 22);
      c.quadraticCurveTo(75, 20, 85, 30);
      c.quadraticCurveTo(95, 50, 60, 90);
      c.fillStyle = '#E53935';
      c.fill();
      // Green leaf top
      c.beginPath();
      c.moveTo(60, 25);
      c.lineTo(40, 12);
      c.lineTo(48, 25);
      c.fillStyle = '#43A047';
      c.fill();
      c.beginPath();
      c.moveTo(60, 25);
      c.lineTo(55, 8);
      c.lineTo(60, 22);
      c.fillStyle = '#43A047';
      c.fill();
      c.beginPath();
      c.moveTo(60, 25);
      c.lineTo(65, 8);
      c.lineTo(60, 22);
      c.fill();
      c.beginPath();
      c.moveTo(60, 25);
      c.lineTo(80, 12);
      c.lineTo(72, 25);
      c.fill();
      // Yellow seed dots
      c.fillStyle = '#FFEB3B';
      const strawberrySeeds = [
        [50, 40], [60, 38], [70, 40],
        [46, 52], [55, 50], [65, 50], [74, 52],
        [50, 62], [60, 60], [70, 62],
        [55, 73], [65, 73],
        [60, 82]
      ];
      strawberrySeeds.forEach(([sx, sy]) => {
        c.beginPath();
        c.ellipse(sx, sy, 1.5, 2, 0, 0, Math.PI * 2);
        c.fill();
      });
      // Shine
      c.beginPath();
      c.arc(48, 38, 4, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fill();
      break;
    }

    case 'MANGO': {
      // Mango body - slightly curved oval
      c.beginPath();
      c.ellipse(60, 58, 28, 35, -0.15, 0, Math.PI * 2);
      c.fillStyle = '#FFB300';
      c.fill();
      // Orange-red blush on one side
      c.beginPath();
      c.ellipse(45, 45, 18, 22, -0.2, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,87,34,0.3)';
      c.fill();
      // Small stem at top
      c.beginPath();
      c.moveTo(58, 22);
      c.lineTo(56, 14);
      c.lineTo(60, 14);
      c.lineTo(62, 22);
      c.fillStyle = '#5D4037';
      c.fill();
      // White shine
      c.beginPath();
      c.arc(50, 45, 6, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.fill();
      break;
    }

    case 'CHERRY': {
      // Green stems meeting at top
      c.beginPath();
      c.moveTo(42, 65);
      c.quadraticCurveTo(45, 30, 60, 12);
      c.strokeStyle = '#388E3C';
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.stroke();
      c.beginPath();
      c.moveTo(78, 65);
      c.quadraticCurveTo(75, 30, 60, 12);
      c.stroke();
      // Small leaf at junction
      c.beginPath();
      c.ellipse(67, 16, 10, 5, 0.3, 0, Math.PI * 2);
      c.fillStyle = '#43A047';
      c.fill();
      // Left cherry
      c.beginPath();
      c.arc(42, 72, 18, 0, Math.PI * 2);
      c.fillStyle = '#D32F2F';
      c.fill();
      // Right cherry
      c.beginPath();
      c.arc(78, 72, 18, 0, Math.PI * 2);
      c.fillStyle = '#D32F2F';
      c.fill();
      // Shine on left cherry
      c.beginPath();
      c.arc(36, 66, 5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fill();
      // Shine on right cherry
      c.beginPath();
      c.arc(72, 66, 5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fill();
      break;
    }

    // ===================== VEGETABLES =====================

    case 'CARROT': {
      // Orange carrot body (triangle/cone pointing down)
      c.beginPath();
      c.moveTo(60, 95);
      c.lineTo(40, 35);
      c.quadraticCurveTo(60, 28, 80, 35);
      c.closePath();
      c.fillStyle = '#FF6D00';
      c.fill();
      // Horizontal lines for texture
      c.strokeStyle = '#E65100';
      c.lineWidth = 1;
      [45, 55, 65, 75].forEach(y => {
        const w = (95 - y) / 95 * 18;
        c.beginPath();
        c.moveTo(60 - w, y);
        c.lineTo(60 + w, y);
        c.stroke();
      });
      // Green leafy top
      c.fillStyle = '#43A047';
      c.beginPath();
      c.ellipse(50, 22, 5, 14, -0.3, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(60, 18, 4, 16, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(70, 22, 5, 14, 0.3, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'TOMATO': {
      // Red tomato body
      c.beginPath();
      c.arc(60, 60, 32, 0, Math.PI * 2);
      c.fillStyle = '#E53935';
      c.fill();
      // Green star-shaped stem top
      c.fillStyle = '#388E3C';
      const starPoints = 5;
      for (let i = 0; i < starPoints; i++) {
        const angle = (i * 2 * Math.PI / starPoints) - Math.PI / 2;
        c.beginPath();
        c.ellipse(
          60 + Math.cos(angle) * 8,
          28 + Math.sin(angle) * 8,
          4, 10,
          angle + Math.PI / 2,
          0, Math.PI * 2
        );
        c.fill();
      }
      // Small stem
      c.beginPath();
      c.arc(60, 26, 3, 0, Math.PI * 2);
      c.fillStyle = '#2E7D32';
      c.fill();
      // White shine
      c.beginPath();
      c.arc(48, 48, 6, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.fill();
      break;
    }

    case 'BROCCOLI': {
      // Brown trunk
      c.beginPath();
      c.moveTo(54, 90);
      c.lineTo(50, 60);
      c.lineTo(70, 60);
      c.lineTo(66, 90);
      c.fillStyle = '#6D4C41';
      c.fill();
      // Green fluffy top - cluster of circles
      const broccoliTops = [
        [45, 48, 14], [60, 40, 16], [75, 48, 14],
        [50, 35, 12], [70, 35, 12],
        [60, 28, 10]
      ];
      broccoliTops.forEach(([bx, by, br]) => {
        c.beginPath();
        c.arc(bx, by, br, 0, Math.PI * 2);
        c.fillStyle = '#43A047';
        c.fill();
      });
      // Darker green dots for texture
      c.fillStyle = '#2E7D32';
      broccoliTops.forEach(([bx, by, br]) => {
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = Math.random() * br * 0.6;
          c.beginPath();
          c.arc(bx + Math.cos(a) * d, by + Math.sin(a) * d, 2, 0, Math.PI * 2);
          c.fill();
        }
      });
      break;
    }

    case 'CORN': {
      // Yellow corn body (elongated oval)
      c.beginPath();
      c.ellipse(60, 55, 20, 38, 0, 0, Math.PI * 2);
      c.fillStyle = '#FFD600';
      c.fill();
      // Grid lines for kernels
      c.strokeStyle = '#F9A825';
      c.lineWidth = 0.8;
      // Vertical lines
      for (let x = -15; x <= 15; x += 6) {
        c.beginPath();
        c.moveTo(60 + x, 20);
        c.lineTo(60 + x, 90);
        c.stroke();
      }
      // Horizontal lines
      for (let y = 22; y <= 88; y += 6) {
        const ry = Math.abs(y - 55);
        const w = Math.sqrt(Math.max(0, 1 - (ry * ry) / (38 * 38))) * 20;
        c.beginPath();
        c.moveTo(60 - w, y);
        c.lineTo(60 + w, y);
        c.stroke();
      }
      // Green husk leaves on left
      c.beginPath();
      c.moveTo(40, 55);
      c.quadraticCurveTo(15, 40, 20, 15);
      c.quadraticCurveTo(25, 30, 40, 45);
      c.fillStyle = '#43A047';
      c.fill();
      // Green husk leaf on right
      c.beginPath();
      c.moveTo(80, 55);
      c.quadraticCurveTo(105, 40, 100, 15);
      c.quadraticCurveTo(95, 30, 80, 45);
      c.fillStyle = '#43A047';
      c.fill();
      break;
    }

    case 'POTATO': {
      // Brown potato body (irregular oval)
      c.beginPath();
      c.ellipse(60, 58, 35, 25, 0.1, 0, Math.PI * 2);
      c.fillStyle = '#8D6E63';
      c.fill();
      // Darker brown spots (eyes)
      c.fillStyle = '#5D4037';
      const potatoEyes = [[45, 50], [55, 62], [70, 48], [75, 60], [50, 55]];
      potatoEyes.forEach(([px, py]) => {
        c.beginPath();
        c.arc(px, py, 2, 0, Math.PI * 2);
        c.fill();
      });
      // Shine
      c.beginPath();
      c.arc(50, 46, 5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.25)';
      c.fill();
      break;
    }

    case 'ONION': {
      // Main onion body (light purple/tan oval)
      c.beginPath();
      c.ellipse(60, 58, 30, 35, 0, 0, Math.PI * 2);
      c.fillStyle = '#CE93D8';
      c.fill();
      // Layer lines
      c.strokeStyle = '#AB47BC';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(60, 58, 20, 32, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(60, 58, 10, 28, 0, 0, Math.PI * 2);
      c.stroke();
      // Pointed top
      c.beginPath();
      c.moveTo(52, 25);
      c.quadraticCurveTo(60, 8, 68, 25);
      c.fillStyle = '#CE93D8';
      c.fill();
      // Small roots at bottom
      c.strokeStyle = '#8D6E63';
      c.lineWidth = 1.5;
      c.lineCap = 'round';
      [55, 58, 61, 64].forEach(rx => {
        c.beginPath();
        c.moveTo(rx, 90);
        c.lineTo(rx + (Math.random() - 0.5) * 4, 98);
        c.stroke();
      });
      // Shine
      c.beginPath();
      c.arc(48, 48, 5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fill();
      break;
    }

    case 'PUMPKIN': {
      // Orange pumpkin body
      c.beginPath();
      c.ellipse(60, 60, 38, 32, 0, 0, Math.PI * 2);
      c.fillStyle = '#FF6D00';
      c.fill();
      // Vertical section lines
      c.strokeStyle = '#E65100';
      c.lineWidth = 1.5;
      [-24, -10, 4, 18].forEach(offset => {
        c.beginPath();
        c.moveTo(60 + offset, 30);
        c.quadraticCurveTo(60 + offset - 2, 60, 60 + offset, 90);
        c.stroke();
      });
      // Green stem
      c.beginPath();
      c.moveTo(55, 30);
      c.lineTo(53, 16);
      c.lineTo(60, 12);
      c.lineTo(67, 16);
      c.lineTo(65, 30);
      c.fillStyle = '#388E3C';
      c.fill();
      // Shine
      c.beginPath();
      c.arc(45, 50, 6, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fill();
      break;
    }

    case 'CUCUMBER': {
      // Green cucumber body (elongated oval)
      c.beginPath();
      c.ellipse(60, 55, 22, 40, 0, 0, Math.PI * 2);
      c.fillStyle = '#66BB6A';
      c.fill();
      // Darker green stripe down the middle
      c.beginPath();
      c.ellipse(60, 55, 8, 38, 0, 0, Math.PI * 2);
      c.fillStyle = '#388E3C';
      c.fill();
      // Subtle lighter stripes on sides
      c.beginPath();
      c.ellipse(50, 55, 3, 35, 0, 0, Math.PI * 2);
      c.fillStyle = '#81C784';
      c.fill();
      c.beginPath();
      c.ellipse(70, 55, 3, 35, 0, 0, Math.PI * 2);
      c.fillStyle = '#81C784';
      c.fill();
      // Small bumps / texture dots
      c.fillStyle = '#4CAF50';
      [[48, 35], [72, 40], [50, 70], [68, 75], [55, 50], [65, 58]].forEach(([dx, dy]) => {
        c.beginPath();
        c.arc(dx, dy, 2, 0, Math.PI * 2);
        c.fill();
      });
      // Stem end at top
      c.beginPath();
      c.arc(60, 16, 4, 0, Math.PI * 2);
      c.fillStyle = '#FFD600';
      c.fill();
      // Shine
      c.beginPath();
      c.arc(52, 40, 4, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fill();
      break;
    }

    default:
      // Draw a question mark for unknown types
      c.fillStyle = '#9E9E9E';
      c.font = 'bold 48px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('?', 60, 55);
      break;
  }
}
