function drawKitchenHouse(canvas, type) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 120, 110);
  c.lineJoin = 'round';
  c.lineCap = 'round';

  switch (type) {

    // ==================== KITCHEN ====================

    case 'CUP': {
      // Mug body
      c.fillStyle = '#87CEEB';
      c.strokeStyle = '#4A90D9';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(30, 25);
      c.lineTo(30, 85);
      c.quadraticCurveTo(30, 95, 40, 95);
      c.lineTo(75, 95);
      c.quadraticCurveTo(85, 95, 85, 85);
      c.lineTo(85, 25);
      c.closePath();
      c.fill();
      c.stroke();

      // Handle
      c.fillStyle = 'transparent';
      c.strokeStyle = '#4A90D9';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(89, 55, 14, -Math.PI / 2, Math.PI / 2);
      c.stroke();

      // Rim highlight
      c.fillStyle = '#B0E0FF';
      c.fillRect(32, 25, 51, 6);
      c.strokeStyle = '#4A90D9';
      c.lineWidth = 2;
      c.strokeRect(30, 25, 55, 6);
      break;
    }

    case 'PLATE': {
      // Outer rim
      c.fillStyle = '#E8E8E8';
      c.strokeStyle = '#3498DB';
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(60, 60, 48, 35, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Inner plate surface
      c.fillStyle = '#FFFEF5';
      c.strokeStyle = '#CCCCCC';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(60, 60, 34, 24, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Decorative dots on rim
      c.fillStyle = '#3498DB';
      for (var a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        c.beginPath();
        c.arc(60 + Math.cos(a) * 42, 60 + Math.sin(a) * 30, 2, 0, Math.PI * 2);
        c.fill();
      }
      break;
    }

    case 'SPOON': {
      // Handle
      c.strokeStyle = '#A0A0A0';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(60, 50);
      c.lineTo(60, 100);
      c.stroke();

      // Spoon head (oval)
      c.fillStyle = '#C0C0C0';
      c.strokeStyle = '#888888';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(60, 32, 16, 22, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Inner shading
      c.fillStyle = '#D8D8D8';
      c.beginPath();
      c.ellipse(60, 34, 10, 14, 0, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'FORK': {
      // Handle
      c.fillStyle = '#C0C0C0';
      c.strokeStyle = '#888888';
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(54, 50, 12, 50, 3);
      c.fill();
      c.stroke();

      // Prong base
      c.fillStyle = '#C0C0C0';
      c.beginPath();
      c.roundRect(42, 35, 36, 18, 3);
      c.fill();
      c.stroke();

      // Prongs (4)
      c.lineWidth = 2;
      var prongX = [46, 54, 62, 70];
      for (var i = 0; i < 4; i++) {
        c.fillStyle = '#C0C0C0';
        c.strokeStyle = '#888888';
        c.beginPath();
        c.roundRect(prongX[i], 10, 5, 28, [3, 3, 0, 0]);
        c.fill();
        c.stroke();
      }
      break;
    }

    case 'BOWL': {
      // Bowl body (U shape)
      c.fillStyle = '#FFFEF5';
      c.strokeStyle = '#E74C3C';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(15, 40);
      c.lineTo(15, 55);
      c.quadraticCurveTo(15, 90, 60, 90);
      c.quadraticCurveTo(105, 90, 105, 55);
      c.lineTo(105, 40);
      c.closePath();
      c.fill();
      c.stroke();

      // Rim
      c.fillStyle = '#E74C3C';
      c.beginPath();
      c.ellipse(60, 40, 45, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#C0392B';
      c.lineWidth = 2;
      c.stroke();

      // Inner rim
      c.fillStyle = '#FFFEF5';
      c.beginPath();
      c.ellipse(60, 40, 38, 5, 0, 0, Math.PI * 2);
      c.fill();

      // Food dots inside
      c.fillStyle = '#F39C12';
      c.beginPath(); c.arc(50, 50, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#27AE60';
      c.beginPath(); c.arc(65, 48, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E74C3C';
      c.beginPath(); c.arc(55, 58, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F39C12';
      c.beginPath(); c.arc(72, 55, 3, 0, Math.PI * 2); c.fill();
      break;
    }

    case 'POT': {
      // Pot body
      c.fillStyle = '#666666';
      c.strokeStyle = '#444444';
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(20, 40, 80, 55, [0, 0, 6, 6]);
      c.fill();
      c.stroke();

      // Lid
      c.fillStyle = '#777777';
      c.strokeStyle = '#444444';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(60, 40, 45, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Lid knob
      c.fillStyle = '#333333';
      c.beginPath();
      c.arc(60, 28, 6, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      // Knob stem
      c.fillStyle = '#555555';
      c.fillRect(57, 32, 6, 6);

      // Left handle
      c.strokeStyle = '#444444';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(16, 58, 10, Math.PI / 2, Math.PI * 1.5);
      c.stroke();

      // Right handle
      c.beginPath();
      c.arc(104, 58, 10, -Math.PI / 2, Math.PI / 2);
      c.stroke();
      break;
    }

    case 'PAN': {
      // Pan body (circle)
      c.fillStyle = '#555555';
      c.strokeStyle = '#333333';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(48, 60, 38, 32, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Inner surface
      c.fillStyle = '#666666';
      c.beginPath();
      c.ellipse(48, 60, 32, 26, 0, 0, Math.PI * 2);
      c.fill();

      // Egg (yellow yolk)
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.ellipse(48, 58, 18, 15, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#FFD700';
      c.beginPath();
      c.arc(48, 56, 9, 0, Math.PI * 2);
      c.fill();

      // Handle
      c.fillStyle = '#8B4513';
      c.strokeStyle = '#5C2D00';
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(84, 52, 30, 12, 4);
      c.fill();
      c.stroke();
      break;
    }

    case 'GLASS': {
      // Glass body (trapezoid)
      c.fillStyle = 'rgba(173, 216, 230, 0.35)';
      c.strokeStyle = '#87CEEB';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(35, 15);
      c.lineTo(28, 95);
      c.lineTo(92, 95);
      c.lineTo(85, 15);
      c.closePath();
      c.fill();
      c.stroke();

      // Liquid inside
      c.fillStyle = 'rgba(255, 165, 0, 0.5)';
      c.beginPath();
      c.moveTo(39, 45);
      c.lineTo(29, 93);
      c.lineTo(91, 93);
      c.lineTo(81, 45);
      c.closePath();
      c.fill();

      // Rim highlight
      c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(37, 18);
      c.lineTo(32, 60);
      c.stroke();

      // Bottom
      c.fillStyle = 'rgba(173, 216, 230, 0.4)';
      c.fillRect(28, 93, 64, 4);
      break;
    }

    // ==================== HOUSE ====================

    case 'CHAIR': {
      var woodColor = '#8B6914';
      var darkWood = '#6B4F12';
      c.fillStyle = woodColor;
      c.strokeStyle = darkWood;
      c.lineWidth = 2;

      // Backrest
      c.beginPath();
      c.roundRect(25, 10, 8, 55, 3);
      c.fill();
      c.stroke();
      c.beginPath();
      c.roundRect(53, 10, 8, 55, 3);
      c.fill();
      c.stroke();
      // Backrest horizontal bars
      c.fillRect(25, 15, 36, 6);
      c.strokeRect(25, 15, 36, 6);
      c.fillRect(25, 30, 36, 6);
      c.strokeRect(25, 30, 36, 6);

      // Seat
      c.fillStyle = '#A0782C';
      c.beginPath();
      c.roundRect(20, 60, 55, 8, 3);
      c.fill();
      c.strokeStyle = darkWood;
      c.stroke();

      // Front legs
      c.fillStyle = woodColor;
      c.fillRect(24, 68, 6, 32);
      c.strokeRect(24, 68, 6, 32);
      c.fillRect(65, 68, 6, 32);
      c.strokeRect(65, 68, 6, 32);

      // Support bar between front legs
      c.fillRect(30, 85, 35, 4);
      c.strokeRect(30, 85, 35, 4);
      break;
    }

    case 'TABLE': {
      var tblColor = '#A0782C';
      var tblDark = '#6B4F12';
      c.fillStyle = tblColor;
      c.strokeStyle = tblDark;
      c.lineWidth = 2;

      // Table top
      c.beginPath();
      c.roundRect(10, 35, 100, 10, 3);
      c.fill();
      c.stroke();

      // Top surface highlight
      c.fillStyle = '#B8933C';
      c.fillRect(12, 36, 96, 4);

      // Legs
      c.fillStyle = tblColor;
      c.fillRect(18, 45, 8, 50);
      c.strokeRect(18, 45, 8, 50);
      c.fillRect(94, 45, 8, 50);
      c.strokeRect(94, 45, 8, 50);

      // Cross support
      c.lineWidth = 3;
      c.strokeStyle = tblDark;
      c.beginPath();
      c.moveTo(26, 55);
      c.lineTo(94, 85);
      c.stroke();
      c.beginPath();
      c.moveTo(26, 85);
      c.lineTo(94, 55);
      c.stroke();
      break;
    }

    case 'BED': {
      // Headboard
      c.fillStyle = '#8B6914';
      c.strokeStyle = '#5C4510';
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(8, 20, 12, 60, [5, 5, 0, 0]);
      c.fill();
      c.stroke();

      // Mattress
      c.fillStyle = '#F5F5DC';
      c.strokeStyle = '#CCC';
      c.beginPath();
      c.roundRect(20, 45, 85, 30, 3);
      c.fill();
      c.stroke();

      // Blanket
      c.fillStyle = '#9B59B6';
      c.strokeStyle = '#7D3C98';
      c.beginPath();
      c.roundRect(45, 42, 60, 36, [3, 3, 6, 6]);
      c.fill();
      c.stroke();

      // Blanket stripes
      c.strokeStyle = '#8E44AD';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(50, 50); c.lineTo(102, 50);
      c.moveTo(50, 58); c.lineTo(102, 58);
      c.moveTo(50, 66); c.lineTo(102, 66);
      c.stroke();

      // Pillow
      c.fillStyle = '#FFFACD';
      c.strokeStyle = '#DAA520';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(32, 52, 12, 10, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Bed legs
      c.fillStyle = '#8B6914';
      c.strokeStyle = '#5C4510';
      c.fillRect(18, 78, 6, 14);
      c.strokeRect(18, 78, 6, 14);
      c.fillRect(98, 78, 6, 14);
      c.strokeRect(98, 78, 6, 14);

      // Footboard
      c.beginPath();
      c.roundRect(100, 38, 8, 42, [3, 3, 0, 0]);
      c.fill();
      c.stroke();
      break;
    }

    case 'DOOR': {
      // Door frame
      c.fillStyle = '#D2B48C';
      c.strokeStyle = '#8B6914';
      c.lineWidth = 3;
      c.beginPath();
      c.rect(25, 8, 70, 94);
      c.fill();
      c.stroke();

      // Door surface
      c.fillStyle = '#C19A6B';
      c.fillRect(30, 12, 60, 86);

      // Top panel
      c.fillStyle = '#B8894A';
      c.strokeStyle = '#8B6914';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(36, 18, 48, 30, 3);
      c.fill();
      c.stroke();

      // Bottom panel
      c.beginPath();
      c.roundRect(36, 55, 48, 36, 3);
      c.fill();
      c.stroke();

      // Doorknob
      c.fillStyle = '#FFD700';
      c.strokeStyle = '#DAA520';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(80, 58, 5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Knob highlight
      c.fillStyle = '#FFF8DC';
      c.beginPath();
      c.arc(79, 56, 2, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'WINDOW': {
      // Frame outer
      c.fillStyle = '#F5F5F5';
      c.strokeStyle = '#8B6914';
      c.lineWidth = 4;
      c.beginPath();
      c.roundRect(18, 12, 84, 80, 4);
      c.fill();
      c.stroke();

      // Glass panes (light blue)
      c.fillStyle = '#B0E0FF';
      c.fillRect(22, 16, 36, 34);
      c.fillRect(62, 16, 36, 34);
      c.fillRect(22, 54, 36, 34);
      c.fillRect(62, 54, 36, 34);

      // Cross dividers
      c.fillStyle = '#8B6914';
      c.fillRect(58, 12, 4, 80);
      c.fillRect(18, 50, 84, 4);

      // Left curtain
      c.fillStyle = '#FF6B6B';
      c.globalAlpha = 0.7;
      c.beginPath();
      c.moveTo(18, 12);
      c.quadraticCurveTo(28, 40, 18, 92);
      c.lineTo(30, 92);
      c.quadraticCurveTo(35, 50, 32, 12);
      c.closePath();
      c.fill();

      // Right curtain
      c.beginPath();
      c.moveTo(102, 12);
      c.quadraticCurveTo(92, 40, 102, 92);
      c.lineTo(90, 92);
      c.quadraticCurveTo(85, 50, 88, 12);
      c.closePath();
      c.fill();
      c.globalAlpha = 1.0;

      // Curtain rod
      c.strokeStyle = '#DAA520';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(14, 12);
      c.lineTo(106, 12);
      c.stroke();
      // Rod finials
      c.fillStyle = '#DAA520';
      c.beginPath(); c.arc(14, 12, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(106, 12, 3, 0, Math.PI * 2); c.fill();
      break;
    }

    case 'LAMP': {
      // Light rays (behind shade)
      c.fillStyle = 'rgba(255, 255, 0, 0.15)';
      c.beginPath();
      c.moveTo(35, 45);
      c.lineTo(5, 95);
      c.lineTo(115, 95);
      c.lineTo(85, 45);
      c.closePath();
      c.fill();

      // Lampshade (trapezoid)
      c.fillStyle = '#FFD700';
      c.strokeStyle = '#DAA520';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(35, 50);
      c.lineTo(22, 15);
      c.lineTo(98, 15);
      c.lineTo(85, 50);
      c.closePath();
      c.fill();
      c.stroke();

      // Shade stripes
      c.strokeStyle = '#FFC000';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(42, 48); c.lineTo(32, 18);
      c.moveTo(55, 48); c.lineTo(48, 18);
      c.moveTo(68, 48); c.lineTo(65, 18);
      c.moveTo(78, 48); c.lineTo(78, 18);
      c.stroke();

      // Stand
      c.fillStyle = '#888888';
      c.strokeStyle = '#666666';
      c.lineWidth = 2;
      c.fillRect(56, 50, 8, 35);
      c.strokeRect(56, 50, 8, 35);

      // Base
      c.fillStyle = '#777777';
      c.beginPath();
      c.ellipse(60, 88, 20, 6, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#555555';
      c.stroke();

      // Light glow at bottom of shade
      c.fillStyle = 'rgba(255, 255, 200, 0.5)';
      c.beginPath();
      c.ellipse(60, 50, 25, 4, 0, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'CLOCK': {
      // Clock face
      c.fillStyle = '#FFFEF5';
      c.strokeStyle = '#E74C3C';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(60, 55, 42, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Inner ring
      c.strokeStyle = '#F5B7B1';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(60, 55, 36, 0, Math.PI * 2);
      c.stroke();

      // Hour markers (small ticks)
      c.fillStyle = '#333333';
      for (var h = 0; h < 12; h++) {
        var angle = (h * Math.PI * 2) / 12 - Math.PI / 2;
        var x1 = 60 + Math.cos(angle) * 33;
        var y1 = 55 + Math.sin(angle) * 33;
        c.beginPath();
        c.arc(x1, y1, 2, 0, Math.PI * 2);
        c.fill();
      }

      // Numbers 12, 3, 6, 9
      c.fillStyle = '#333333';
      c.font = 'bold 12px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('12', 60, 22);
      c.fillText('3', 93, 55);
      c.fillText('6', 60, 88);
      c.fillText('9', 27, 55);

      // Hour hand (pointing to ~10)
      c.strokeStyle = '#333333';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(60, 55);
      var ha = (-2 * Math.PI * 10) / 12 + Math.PI / 2;
      c.lineTo(60 + Math.cos(-ha) * 20, 55 - Math.sin(ha) * 20);
      c.stroke();

      // Minute hand (pointing to ~2)
      c.strokeStyle = '#333333';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(60, 55);
      var ma = (2 * Math.PI * 10) / 60 - Math.PI / 2;
      c.lineTo(60 + Math.cos(ma) * 28, 55 + Math.sin(ma) * 28);
      c.stroke();

      // Center dot
      c.fillStyle = '#E74C3C';
      c.beginPath();
      c.arc(60, 55, 3, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'FAN': {
      // Center hub
      c.fillStyle = '#DDDDDD';
      c.strokeStyle = '#999999';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(60, 55, 10, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Blades (4 blades)
      var bladeAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
      c.fillStyle = '#87CEEB';
      c.strokeStyle = '#5DADE2';
      c.lineWidth = 1.5;
      for (var b = 0; b < 4; b++) {
        var ba = bladeAngles[b] - 0.3;
        c.save();
        c.translate(60, 55);
        c.rotate(bladeAngles[b]);
        c.beginPath();
        c.moveTo(0, -8);
        c.quadraticCurveTo(20, -12, 38, -4);
        c.quadraticCurveTo(40, 0, 38, 4);
        c.quadraticCurveTo(20, 12, 0, 8);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      }

      // Center button
      c.fillStyle = '#BBBBBB';
      c.beginPath();
      c.arc(60, 55, 5, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#888888';
      c.stroke();

      // Motion lines (circular)
      c.strokeStyle = 'rgba(150, 200, 255, 0.4)';
      c.lineWidth = 1;
      c.setLineDash([4, 4]);
      c.beginPath();
      c.arc(60, 55, 44, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(60, 55, 48, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);

      // Mounting rod at top
      c.strokeStyle = '#999999';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(60, 5);
      c.lineTo(60, 45);
      c.stroke();
      // Mount plate
      c.fillStyle = '#AAAAAA';
      c.fillRect(50, 2, 20, 6);
      break;
    }
  }
}
