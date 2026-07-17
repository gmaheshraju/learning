function drawVehiclesColors(canvas, type) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 120, 110);

  switch (type) {

    case 'CAR': {
      // Body
      c.fillStyle = '#E53935';
      c.beginPath();
      c.moveTo(15, 65);
      c.lineTo(15, 50);
      c.quadraticCurveTo(15, 42, 23, 42);
      c.lineTo(35, 42);
      c.lineTo(42, 28);
      c.lineTo(78, 28);
      c.lineTo(88, 42);
      c.lineTo(97, 42);
      c.quadraticCurveTo(105, 42, 105, 50);
      c.lineTo(105, 65);
      c.closePath();
      c.fill();
      // Windows
      c.fillStyle = '#BBDEFB';
      c.beginPath();
      c.moveTo(45, 42);
      c.lineTo(48, 31);
      c.lineTo(58, 31);
      c.lineTo(58, 42);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(62, 42);
      c.lineTo(62, 31);
      c.lineTo(75, 31);
      c.lineTo(83, 42);
      c.closePath();
      c.fill();
      // Window outlines
      c.strokeStyle = '#C62828';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(45, 42);
      c.lineTo(48, 31);
      c.lineTo(58, 31);
      c.lineTo(58, 42);
      c.stroke();
      c.beginPath();
      c.moveTo(62, 42);
      c.lineTo(62, 31);
      c.lineTo(75, 31);
      c.lineTo(83, 42);
      c.stroke();
      // Headlights
      c.fillStyle = '#FFF176';
      c.fillRect(100, 48, 5, 6);
      c.fillRect(15, 48, 5, 6);
      // Wheels
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(35, 68, 10, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(85, 68, 10, 0, Math.PI * 2);
      c.fill();
      // Hubcaps
      c.fillStyle = '#9E9E9E';
      c.beginPath();
      c.arc(35, 68, 4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(85, 68, 4, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'BUS': {
      // Body
      c.fillStyle = '#FDD835';
      c.beginPath();
      c.roundRect(10, 30, 100, 40, 5);
      c.fill();
      c.strokeStyle = '#F9A825';
      c.lineWidth = 2;
      c.stroke();
      // Stripe
      c.fillStyle = '#FF8F00';
      c.fillRect(10, 58, 100, 5);
      // Windows
      c.fillStyle = '#BBDEFB';
      var wx = 20;
      for (var i = 0; i < 4; i++) {
        c.fillRect(wx, 36, 15, 14);
        c.strokeStyle = '#F9A825';
        c.lineWidth = 1;
        c.strokeRect(wx, 36, 15, 14);
        wx += 22;
      }
      // Door
      c.fillStyle = '#BBDEFB';
      c.fillRect(90, 38, 10, 22);
      c.strokeStyle = '#F9A825';
      c.lineWidth = 1;
      c.strokeRect(90, 38, 10, 22);
      // Wheels
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(30, 73, 9, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(88, 73, 9, 0, Math.PI * 2);
      c.fill();
      // Hubcaps
      c.fillStyle = '#9E9E9E';
      c.beginPath();
      c.arc(30, 73, 4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(88, 73, 4, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'TRUCK': {
      // Cargo box
      c.fillStyle = '#90A4AE';
      c.beginPath();
      c.roundRect(45, 25, 65, 42, 3);
      c.fill();
      c.strokeStyle = '#607D8B';
      c.lineWidth = 2;
      c.stroke();
      // Cargo lines
      c.strokeStyle = '#78909C';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(70, 25);
      c.lineTo(70, 67);
      c.stroke();
      c.beginPath();
      c.moveTo(90, 25);
      c.lineTo(90, 67);
      c.stroke();
      // Cab
      c.fillStyle = '#1E88E5';
      c.beginPath();
      c.roundRect(10, 35, 38, 32, 4);
      c.fill();
      c.strokeStyle = '#1565C0';
      c.lineWidth = 2;
      c.stroke();
      // Window
      c.fillStyle = '#BBDEFB';
      c.beginPath();
      c.roundRect(16, 39, 22, 14, 2);
      c.fill();
      // Headlight
      c.fillStyle = '#FFF176';
      c.fillRect(10, 55, 5, 5);
      // Wheels
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(30, 72, 10, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(90, 72, 10, 0, Math.PI * 2);
      c.fill();
      // Hubcaps
      c.fillStyle = '#9E9E9E';
      c.beginPath();
      c.arc(30, 72, 4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(90, 72, 4, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'BIKE': {
      // Wheels
      c.strokeStyle = '#212121';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(30, 68, 16, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(90, 68, 16, 0, Math.PI * 2);
      c.stroke();
      // Wheel hubs
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(30, 68, 3, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(90, 68, 3, 0, Math.PI * 2);
      c.fill();
      // Frame
      c.strokeStyle = '#E64A19';
      c.lineWidth = 3;
      // Bottom tube: rear wheel to middle
      c.beginPath();
      c.moveTo(30, 68);
      c.lineTo(60, 50);
      c.stroke();
      // Seat tube
      c.beginPath();
      c.moveTo(60, 50);
      c.lineTo(55, 35);
      c.stroke();
      // Top tube
      c.beginPath();
      c.moveTo(55, 35);
      c.lineTo(30, 68);
      c.stroke();
      // Down tube to front wheel
      c.beginPath();
      c.moveTo(60, 50);
      c.lineTo(90, 68);
      c.stroke();
      // Front fork
      c.beginPath();
      c.moveTo(90, 68);
      c.lineTo(85, 32);
      c.stroke();
      // Handlebars
      c.strokeStyle = '#424242';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(78, 30);
      c.lineTo(92, 30);
      c.stroke();
      // Handle grips
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(78, 30, 3, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(92, 30, 3, 0, Math.PI * 2);
      c.fill();
      // Seat
      c.fillStyle = '#5D4037';
      c.beginPath();
      c.ellipse(55, 33, 8, 4, 0, 0, Math.PI * 2);
      c.fill();
      // Pedal
      c.fillStyle = '#757575';
      c.fillRect(57, 52, 8, 3);
      break;
    }

    case 'TRAIN': {
      // Body
      c.fillStyle = '#2E7D32';
      c.beginPath();
      c.roundRect(15, 35, 90, 32, 4);
      c.fill();
      c.strokeStyle = '#1B5E20';
      c.lineWidth = 2;
      c.stroke();
      // Stripe
      c.fillStyle = '#66BB6A';
      c.fillRect(15, 55, 90, 5);
      // Cabin window
      c.fillStyle = '#BBDEFB';
      c.beginPath();
      c.roundRect(75, 40, 20, 14, 2);
      c.fill();
      // Small windows
      c.fillStyle = '#BBDEFB';
      c.fillRect(25, 41, 10, 10);
      c.fillRect(40, 41, 10, 10);
      c.fillRect(55, 41, 10, 10);
      // Smokestack
      c.fillStyle = '#424242';
      c.fillRect(25, 20, 10, 16);
      c.fillStyle = '#616161';
      c.beginPath();
      c.roundRect(22, 17, 16, 6, 2);
      c.fill();
      // Smoke puffs
      c.fillStyle = 'rgba(189,189,189,0.7)';
      c.beginPath();
      c.arc(30, 12, 6, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(22, 6, 5, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(15, 2, 4, 0, Math.PI * 2);
      c.fill();
      // Cow catcher
      c.fillStyle = '#424242';
      c.beginPath();
      c.moveTo(10, 67);
      c.lineTo(15, 57);
      c.lineTo(15, 67);
      c.closePath();
      c.fill();
      // Wheels
      c.fillStyle = '#212121';
      c.beginPath();
      c.arc(30, 72, 8, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(50, 72, 8, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(70, 72, 8, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(90, 72, 8, 0, Math.PI * 2);
      c.fill();
      // Connecting rod
      c.strokeStyle = '#757575';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(30, 72);
      c.lineTo(90, 72);
      c.stroke();
      break;
    }

    case 'BOAT': {
      // Water
      c.fillStyle = '#29B6F6';
      c.beginPath();
      c.moveTo(0, 80);
      c.quadraticCurveTo(20, 75, 40, 80);
      c.quadraticCurveTo(60, 85, 80, 80);
      c.quadraticCurveTo(100, 75, 120, 80);
      c.lineTo(120, 110);
      c.lineTo(0, 110);
      c.closePath();
      c.fill();
      // Hull
      c.fillStyle = '#1565C0';
      c.beginPath();
      c.moveTo(10, 60);
      c.lineTo(110, 60);
      c.lineTo(100, 80);
      c.quadraticCurveTo(60, 85, 20, 80);
      c.closePath();
      c.fill();
      c.strokeStyle = '#0D47A1';
      c.lineWidth = 2;
      c.stroke();
      // Hull stripe
      c.fillStyle = '#1E88E5';
      c.beginPath();
      c.moveTo(15, 65);
      c.lineTo(108, 65);
      c.lineTo(102, 75);
      c.quadraticCurveTo(60, 79, 18, 75);
      c.closePath();
      c.fill();
      // Cabin
      c.fillStyle = '#FAFAFA';
      c.beginPath();
      c.roundRect(35, 38, 40, 22, 3);
      c.fill();
      c.strokeStyle = '#BDBDBD';
      c.lineWidth = 1;
      c.stroke();
      // Cabin windows
      c.fillStyle = '#BBDEFB';
      c.fillRect(40, 43, 8, 8);
      c.fillRect(52, 43, 8, 8);
      c.fillRect(64, 43, 8, 8);
      // Roof
      c.fillStyle = '#E53935';
      c.beginPath();
      c.roundRect(33, 34, 44, 6, 2);
      c.fill();
      // Flag pole
      c.strokeStyle = '#5D4037';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(85, 60);
      c.lineTo(85, 20);
      c.stroke();
      // Flag
      c.fillStyle = '#E53935';
      c.beginPath();
      c.moveTo(85, 20);
      c.lineTo(100, 26);
      c.lineTo(85, 32);
      c.closePath();
      c.fill();
      break;
    }

    case 'PLANE': {
      // Body (fuselage)
      c.fillStyle = '#FAFAFA';
      c.beginPath();
      c.moveTo(10, 52);
      c.quadraticCurveTo(10, 42, 25, 42);
      c.lineTo(95, 42);
      c.quadraticCurveTo(112, 47, 112, 52);
      c.quadraticCurveTo(112, 57, 95, 62);
      c.lineTo(25, 62);
      c.quadraticCurveTo(10, 62, 10, 52);
      c.closePath();
      c.fill();
      c.strokeStyle = '#BDBDBD';
      c.lineWidth = 1.5;
      c.stroke();
      // Blue stripe
      c.fillStyle = '#1E88E5';
      c.fillRect(18, 50, 90, 4);
      // Windows
      c.fillStyle = '#BBDEFB';
      for (var wx2 = 30; wx2 < 90; wx2 += 8) {
        c.beginPath();
        c.arc(wx2, 48, 2.5, 0, Math.PI * 2);
        c.fill();
      }
      // Cockpit window
      c.fillStyle = '#BBDEFB';
      c.beginPath();
      c.moveTo(100, 46);
      c.quadraticCurveTo(108, 48, 108, 52);
      c.lineTo(100, 52);
      c.closePath();
      c.fill();
      // Wing
      c.fillStyle = '#90CAF9';
      c.beginPath();
      c.moveTo(50, 52);
      c.lineTo(70, 52);
      c.lineTo(75, 82);
      c.lineTo(45, 82);
      c.closePath();
      c.fill();
      c.strokeStyle = '#64B5F6';
      c.lineWidth = 1;
      c.stroke();
      // Tail
      c.fillStyle = '#1E88E5';
      c.beginPath();
      c.moveTo(18, 42);
      c.lineTo(10, 20);
      c.lineTo(30, 42);
      c.closePath();
      c.fill();
      // Tail fin horizontal
      c.fillStyle = '#90CAF9';
      c.beginPath();
      c.moveTo(15, 48);
      c.lineTo(5, 52);
      c.lineTo(5, 56);
      c.lineTo(15, 56);
      c.closePath();
      c.fill();
      // Engine
      c.fillStyle = '#757575';
      c.beginPath();
      c.ellipse(60, 82, 6, 4, 0, 0, Math.PI * 2);
      c.fill();
      break;
    }

    case 'ROCKET': {
      // Flames
      c.fillStyle = '#FF6F00';
      c.beginPath();
      c.moveTo(48, 88);
      c.quadraticCurveTo(52, 100, 55, 105);
      c.quadraticCurveTo(58, 95, 60, 88);
      c.closePath();
      c.fill();
      c.fillStyle = '#FFCA28';
      c.beginPath();
      c.moveTo(53, 88);
      c.quadraticCurveTo(55, 96, 57, 100);
      c.quadraticCurveTo(58, 94, 60, 88);
      c.closePath();
      c.fill();
      c.fillStyle = '#FF6F00';
      c.beginPath();
      c.moveTo(43, 85);
      c.quadraticCurveTo(40, 95, 38, 100);
      c.quadraticCurveTo(44, 92, 48, 85);
      c.closePath();
      c.fill();
      c.fillStyle = '#FF6F00';
      c.beginPath();
      c.moveTo(68, 85);
      c.quadraticCurveTo(72, 95, 75, 100);
      c.quadraticCurveTo(73, 90, 68, 85);
      c.closePath();
      c.fill();
      // Body
      c.fillStyle = '#E53935';
      c.beginPath();
      c.moveTo(42, 85);
      c.lineTo(42, 40);
      c.quadraticCurveTo(42, 12, 57, 8);
      c.quadraticCurveTo(72, 12, 72, 40);
      c.lineTo(72, 85);
      c.closePath();
      c.fill();
      c.strokeStyle = '#C62828';
      c.lineWidth = 2;
      c.stroke();
      // Nose cone
      c.fillStyle = '#FF7043';
      c.beginPath();
      c.moveTo(47, 30);
      c.quadraticCurveTo(50, 14, 57, 8);
      c.quadraticCurveTo(64, 14, 67, 30);
      c.closePath();
      c.fill();
      // Stripe
      c.fillStyle = '#FAFAFA';
      c.fillRect(42, 55, 30, 6);
      // Window
      c.fillStyle = '#BBDEFB';
      c.beginPath();
      c.arc(57, 44, 8, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#90CAF9';
      c.lineWidth = 2;
      c.stroke();
      // Window shine
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.arc(54, 41, 3, 0, Math.PI * 2);
      c.fill();
      // Left fin
      c.fillStyle = '#C62828';
      c.beginPath();
      c.moveTo(42, 72);
      c.lineTo(28, 90);
      c.lineTo(42, 88);
      c.closePath();
      c.fill();
      // Right fin
      c.beginPath();
      c.moveTo(72, 72);
      c.lineTo(86, 90);
      c.lineTo(72, 88);
      c.closePath();
      c.fill();
      break;
    }

    case 'CLR_RED': {
      drawColorSplat(c, '#E53935', '#C62828');
      break;
    }

    case 'CLR_BLUE': {
      drawColorSplat(c, '#1E88E5', '#1565C0');
      break;
    }

    case 'CLR_GREEN': {
      drawColorSplat(c, '#43A047', '#2E7D32');
      break;
    }

    case 'CLR_YELLOW': {
      drawColorSplat(c, '#FDD835', '#F9A825');
      break;
    }

    case 'CLR_PURPLE': {
      drawColorSplat(c, '#8E24AA', '#6A1B9A');
      break;
    }

    case 'CLR_PINK': {
      drawColorSplat(c, '#EC407A', '#C2185B');
      break;
    }

    case 'CLR_BROWN': {
      drawColorSplat(c, '#6D4C41', '#4E342E');
      break;
    }

    case 'CLR_WHITE': {
      drawColorSplat(c, '#FAFAFA', '#9E9E9E', true);
      break;
    }
  }
}

function drawColorSplat(c, color, darker, needsOutline) {
  // Main splat blob
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(60, 12);
  c.bezierCurveTo(85, 8, 100, 18, 105, 35);
  c.bezierCurveTo(112, 50, 108, 65, 100, 75);
  c.bezierCurveTo(95, 85, 80, 95, 65, 98);
  c.bezierCurveTo(50, 100, 30, 95, 20, 82);
  c.bezierCurveTo(8, 68, 5, 50, 12, 35);
  c.bezierCurveTo(18, 20, 38, 14, 60, 12);
  c.closePath();
  c.fill();

  if (needsOutline) {
    c.strokeStyle = darker;
    c.lineWidth = 2;
    c.stroke();
  }

  // Smaller splat bumps for organic look
  c.fillStyle = color;
  c.beginPath();
  c.arc(95, 28, 10, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(18, 72, 8, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(80, 90, 7, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(30, 22, 7, 0, Math.PI * 2);
  c.fill();

  if (needsOutline) {
    c.strokeStyle = darker;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(95, 28, 10, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(18, 72, 8, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(80, 90, 7, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(30, 22, 7, 0, Math.PI * 2);
    c.stroke();
  }

  // Little splash droplets
  c.fillStyle = color;
  c.beginPath();
  c.arc(105, 20, 4, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(10, 85, 3, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(45, 100, 3, 0, Math.PI * 2);
  c.fill();

  if (needsOutline) {
    c.strokeStyle = darker;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(105, 20, 4, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(10, 85, 3, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(45, 100, 3, 0, Math.PI * 2);
    c.stroke();
  }

  // Darker shadow on bottom area
  c.fillStyle = darker;
  c.globalAlpha = 0.2;
  c.beginPath();
  c.ellipse(58, 78, 28, 14, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1.0;

  // White shine highlight
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.beginPath();
  c.ellipse(45, 35, 12, 8, -0.4, 0, Math.PI * 2);
  c.fill();

  // Small shine dot
  c.fillStyle = 'rgba(255,255,255,0.8)';
  c.beginPath();
  c.arc(40, 30, 4, 0, Math.PI * 2);
  c.fill();
}
