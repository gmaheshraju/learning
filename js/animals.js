function drawAnimal(cv, type) {
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.clearRect(0, 0, w, h);

  const D = {
    DOG: () => {
      c.fillStyle = '#C68642'; c.beginPath(); c.ellipse(60, 72, 28, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D4944C'; c.beginPath(); c.arc(60, 40, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8B5E3C'; c.beginPath(); c.ellipse(40, 26, 8, 14, -.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(80, 26, 8, 14, .4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2C1810'; c.beginPath(); c.arc(52, 38, 3.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 38, 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(53, 37, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(69, 37, 1.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2C1810'; c.beginPath(); c.ellipse(60, 47, 5, 3.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF8A9E'; c.beginPath(); c.ellipse(60, 55, 4, 5, 0, 0, Math.PI); c.fill();
      c.strokeStyle = '#C68642'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(88, 65); c.quadraticCurveTo(100, 50, 95, 38); c.stroke();
      c.fillStyle = '#C68642';
      [42, 54, 66, 78].forEach(x => { c.fillRect(x - 3, 88, 6, 12) });
      c.fillStyle = '#D4944C';
      [42, 54, 66, 78].forEach(x => { c.beginPath(); c.ellipse(x, 100, 5, 3, 0, 0, Math.PI * 2); c.fill() });
    },

    CAT: () => {
      c.fillStyle = '#A0A0A0'; c.beginPath(); c.ellipse(60, 72, 24, 20, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#B0B0B0'; c.beginPath(); c.arc(60, 40, 20, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#909090';
      c.beginPath(); c.moveTo(42, 28); c.lineTo(36, 10); c.lineTo(52, 24); c.fill();
      c.beginPath(); c.moveTo(78, 28); c.lineTo(84, 10); c.lineTo(68, 24); c.fill();
      c.fillStyle = '#FFB6C1';
      c.beginPath(); c.moveTo(44, 27); c.lineTo(40, 15); c.lineTo(50, 25); c.fill();
      c.beginPath(); c.moveTo(76, 27); c.lineTo(80, 15); c.lineTo(70, 25); c.fill();
      c.fillStyle = '#4CAF50'; c.beginPath(); c.ellipse(52, 38, 4, 5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(68, 38, 4, 5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B1B1B'; c.beginPath(); c.ellipse(52, 38, 2, 4.5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(68, 38, 2, 4.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(53, 36, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(69, 36, 1.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB6C1'; c.beginPath(); c.moveTo(60, 44); c.lineTo(57, 47); c.lineTo(63, 47); c.fill();
      c.strokeStyle = '#888'; c.lineWidth = 1;
      [[30, 44, 50, 43], [30, 48, 50, 47], [90, 44, 70, 43], [90, 48, 70, 47]].forEach(([a, b, d, e]) => {
        c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke();
      });
    },

    ELEPHANT: () => {
      c.fillStyle = '#78909C'; c.beginPath(); c.ellipse(62, 68, 30, 24, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#90A4AE'; c.beginPath(); c.arc(55, 40, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#607D8B'; c.beginPath(); c.ellipse(32, 40, 14, 18, -.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB6C1'; c.beginPath(); c.ellipse(33, 40, 9, 12, -.2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#90A4AE'; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(55, 55); c.quadraticCurveTo(50, 75, 42, 85); c.quadraticCurveTo(38, 90, 35, 88); c.stroke();
      c.fillStyle = '#263238'; c.beginPath(); c.arc(50, 36, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(51, 35, 1.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#78909C';
      [44, 56, 70, 82].forEach(x => { c.fillRect(x - 4, 86, 8, 14) });
    },

    LION: () => {
      c.fillStyle = '#E65100';
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        c.beginPath(); c.ellipse(60 + Math.cos(a) * 18, 42 + Math.sin(a) * 18, 10, 10, a, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#FFB74D'; c.beginPath(); c.ellipse(60, 72, 26, 20, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFCC02'; c.beginPath(); c.arc(60, 42, 18, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3E2723'; c.beginPath(); c.arc(53, 40, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(67, 40, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(54, 39, 1.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 39, 1.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5D4037'; c.beginPath(); c.ellipse(60, 48, 4, 3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB74D';
      [42, 54, 66, 78].forEach(x => { c.fillRect(x - 3, 86, 7, 14) });
    },

    RABBIT: () => {
      c.fillStyle = '#F5F5F5'; c.beginPath(); c.ellipse(60, 72, 22, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FAFAFA'; c.beginPath(); c.arc(60, 42, 18, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F5F5F5';
      c.beginPath(); c.ellipse(48, 14, 6, 20, -.15, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(72, 14, 6, 20, .15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB6C1';
      c.beginPath(); c.ellipse(48, 14, 3.5, 15, -.15, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(72, 14, 3.5, 15, .15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D81B60'; c.beginPath(); c.arc(52, 40, 3.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 40, 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(53, 39, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(69, 39, 1.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB6C1'; c.beginPath(); c.ellipse(60, 48, 3, 2.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.fillRect(57, 51, 3, 4); c.fillRect(61, 51, 3, 4);
    },

    FISH: () => {
      c.fillStyle = '#FF7043'; c.beginPath(); c.ellipse(58, 55, 28, 18, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF5722'; c.beginPath(); c.moveTo(86, 55); c.lineTo(105, 38); c.lineTo(105, 72); c.fill();
      c.fillStyle = '#FF8A65'; c.beginPath(); c.moveTo(55, 37); c.quadraticCurveTo(58, 22, 68, 30); c.lineTo(62, 38); c.fill();
      c.fillStyle = '#FFAB91'; c.beginPath(); c.ellipse(55, 55, 8, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(42, 50, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B1B1B'; c.beginPath(); c.arc(42, 50, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(43, 49, 1.3, 0, Math.PI * 2); c.fill();
    },

    BIRD: () => {
      c.fillStyle = '#42A5F5'; c.beginPath(); c.ellipse(60, 60, 20, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#64B5F6'; c.beginPath(); c.arc(55, 38, 14, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1E88E5';
      c.beginPath(); c.moveTo(70, 50); c.quadraticCurveTo(95, 40, 90, 60); c.quadraticCurveTo(85, 72, 68, 65); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(50, 36, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B1B1B'; c.beginPath(); c.arc(50, 36, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF9800'; c.beginPath(); c.moveTo(42, 40); c.lineTo(30, 38); c.lineTo(42, 44); c.fill();
      c.fillStyle = '#BBDEFB'; c.beginPath(); c.ellipse(58, 65, 12, 10, 0, 0, Math.PI); c.fill();
    },

    MONKEY: () => {
      c.fillStyle = '#8D6E63'; c.beginPath(); c.ellipse(60, 70, 22, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D7CCC8'; c.beginPath(); c.ellipse(60, 74, 14, 14, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1887F'; c.beginPath(); c.arc(60, 38, 20, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#EFEBE9'; c.beginPath(); c.ellipse(60, 44, 14, 12, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1887F';
      c.beginPath(); c.arc(38, 36, 8, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(82, 36, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#EFEBE9';
      c.beginPath(); c.arc(38, 36, 5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(82, 36, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3E2723'; c.beginPath(); c.arc(52, 40, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 40, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(53, 39, 1.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(69, 39, 1.3, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#5D4037'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(60, 48, 8, .3, Math.PI - .3); c.stroke();
    },

    FROG: () => {
      c.fillStyle = '#66BB6A'; c.beginPath(); c.ellipse(60, 65, 28, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#81C784'; c.beginPath(); c.ellipse(60, 42, 22, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#C8E6C9'; c.beginPath(); c.ellipse(60, 70, 18, 16, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#FFF';
      c.beginPath(); c.arc(46, 30, 10, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(74, 30, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B5E20';
      c.beginPath(); c.arc(46, 30, 5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(74, 30, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#000';
      c.beginPath(); c.arc(46, 30, 2.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(74, 30, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF';
      c.beginPath(); c.arc(48, 28, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(76, 28, 1.5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#2E7D32'; c.lineWidth = 2;
      c.beginPath(); c.arc(60, 46, 16, .1, Math.PI - .1); c.stroke();
      c.fillStyle = '#66BB6A';
      c.beginPath(); c.ellipse(34, 92, 12, 6, -.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(86, 92, 12, 6, .3, 0, Math.PI * 2); c.fill();
    },

    BUTTERFLY: () => {
      c.fillStyle = '#AB47BC';
      c.beginPath(); c.ellipse(38, 40, 22, 16, -.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(82, 40, 22, 16, .4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#CE93D8';
      c.beginPath(); c.ellipse(40, 66, 16, 12, -.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(80, 66, 16, 12, .2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E1BEE7';
      c.beginPath(); c.arc(35, 38, 8, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(85, 38, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#4A148C'; c.beginPath(); c.ellipse(60, 52, 4, 24, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6A1B9A'; c.beginPath(); c.arc(60, 26, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF';
      c.beginPath(); c.arc(57, 25, 2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(63, 25, 2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#4A148C'; c.lineWidth = 1.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(57, 21); c.quadraticCurveTo(48, 8, 42, 6); c.stroke();
      c.beginPath(); c.moveTo(63, 21); c.quadraticCurveTo(72, 8, 78, 6); c.stroke();
      c.fillStyle = '#AB47BC';
      c.beginPath(); c.arc(42, 6, 2.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(78, 6, 2.5, 0, Math.PI * 2); c.fill();
    },

    TURTLE: () => {
      c.fillStyle = '#558B2F'; c.beginPath(); c.ellipse(60, 55, 30, 24, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#689F38'; c.beginPath(); c.arc(60, 48, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#7CB342';
      [[45, 60, 7], [75, 60, 7], [55, 38, 6], [65, 38, 6]].forEach(([x, y, r]) => {
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      });
      c.fillStyle = '#8BC34A'; c.beginPath(); c.ellipse(28, 50, 10, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillRect(30, 46, 12, 10);
      c.fillStyle = '#1B1B1B'; c.beginPath(); c.arc(24, 48, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(25, 47, 1, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8BC34A';
      c.beginPath(); c.ellipse(40, 80, 8, 5, -.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(80, 80, 8, 5, .3, 0, Math.PI * 2); c.fill();
    },

    PARROT: () => {
      c.fillStyle = '#4CAF50'; c.beginPath(); c.ellipse(58, 65, 18, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F44336'; c.beginPath(); c.moveTo(50, 85); c.lineTo(42, 108); c.lineTo(58, 108); c.lineTo(66, 85); c.fill();
      c.fillStyle = '#2196F3'; c.beginPath(); c.moveTo(53, 85); c.lineTo(48, 105); c.lineTo(58, 105); c.lineTo(62, 85); c.fill();
      c.fillStyle = '#66BB6A'; c.beginPath(); c.arc(55, 36, 16, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF'; c.beginPath(); c.arc(48, 34, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B1B1B'; c.beginPath(); c.arc(48, 34, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF9800';
      c.beginPath(); c.moveTo(42, 40); c.quadraticCurveTo(32, 36, 34, 44); c.quadraticCurveTo(36, 48, 44, 44); c.fill();
      c.fillStyle = '#FFEB3B'; c.beginPath(); c.ellipse(57, 72, 12, 12, 0, 0, Math.PI); c.fill();
    },

    PENGUIN: () => {
      c.fillStyle = '#263238'; c.beginPath(); c.ellipse(60, 62, 22, 28, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ECEFF1'; c.beginPath(); c.ellipse(60, 68, 14, 22, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#263238'; c.beginPath(); c.arc(60, 34, 16, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF';
      c.beginPath(); c.arc(52, 32, 5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 32, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1B1B1B';
      c.beginPath(); c.arc(52, 32, 2.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, 32, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF9800'; c.beginPath(); c.moveTo(56, 40); c.lineTo(60, 46); c.lineTo(64, 40); c.fill();
      c.fillStyle = '#37474F';
      c.beginPath(); c.ellipse(36, 60, 6, 18, .2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(84, 60, 6, 18, -.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF9800';
      c.beginPath(); c.ellipse(50, 94, 8, 4, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(70, 94, 8, 4, 0, 0, Math.PI * 2); c.fill();
    },

    GIRAFFE: () => {
      c.fillStyle = '#FFB74D'; c.fillRect(52, 10, 16, 55);
      c.fillStyle = '#E65100';
      [[56, 18, 3], [64, 28, 3], [58, 38, 2.5], [62, 48, 3]].forEach(([x, y, r]) => {
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      });
      c.fillStyle = '#FFB74D'; c.beginPath(); c.ellipse(60, 75, 26, 18, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E65100';
      [[48, 70, 3.5], [68, 72, 3]].forEach(([x, y, r]) => {
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      });
      c.fillStyle = '#FFCC80'; c.beginPath(); c.ellipse(60, 10, 10, 8, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#8D6E63'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(52, 4); c.lineTo(52, -2); c.stroke();
      c.beginPath(); c.moveTo(68, 4); c.lineTo(68, -2); c.stroke();
      c.fillStyle = '#FFB74D';
      c.beginPath(); c.arc(52, -2, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(68, -2, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3E2723';
      c.beginPath(); c.arc(55, 10, 2.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(65, 10, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFB74D';
      [42, 52, 68, 78].forEach(x => { c.fillRect(x - 3, 88, 6, 14) });
    },

    OWL: () => {
      c.fillStyle = '#795548'; c.beginPath(); c.ellipse(60, 68, 24, 24, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D7CCC8'; c.beginPath(); c.ellipse(60, 74, 14, 16, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#8D6E63'; c.beginPath(); c.arc(60, 38, 20, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6D4C41';
      c.beginPath(); c.moveTo(42, 24); c.lineTo(34, 8); c.lineTo(50, 22); c.fill();
      c.beginPath(); c.moveTo(78, 24); c.lineTo(86, 8); c.lineTo(70, 22); c.fill();
      c.fillStyle = '#EFEBE9';
      c.beginPath(); c.ellipse(50, 38, 10, 10, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(70, 38, 10, 10, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF8F00';
      c.beginPath(); c.arc(50, 38, 7, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(70, 38, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#000';
      c.beginPath(); c.arc(50, 38, 3.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(70, 38, 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFF';
      c.beginPath(); c.arc(52, 36, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(72, 36, 1.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FF9800'; c.beginPath(); c.moveTo(60, 42); c.lineTo(57, 48); c.lineTo(63, 48); c.fill();
    }
  };

  if (D[type]) try { D[type]() } catch (e) { }
}

const ANIMAL_IDS = ['DOG','CAT','ELEPHANT','LION','RABBIT','FISH','BIRD','MONKEY','FROG','BUTTERFLY','TURTLE','PARROT','PENGUIN','GIRAFFE','OWL'];
const FRUIT_VEG_IDS = ['APPLE','BANANA','ORANGE_FRUIT','GRAPES','WATERMELON','STRAWBERRY','MANGO','CHERRY','CARROT','TOMATO','BROCCOLI','CORN','POTATO','ONION','PUMPKIN','CUCUMBER'];
const KITCHEN_HOUSE_IDS = ['CUP','PLATE','SPOON','FORK','BOWL','POT','PAN','GLASS','CHAIR','TABLE','BED','DOOR','WINDOW','LAMP','CLOCK','FAN'];

function drawItem(canvas, type) {
  if (ANIMAL_IDS.includes(type)) return drawAnimal(canvas, type);
  if (FRUIT_VEG_IDS.includes(type)) return drawFruitsVegs(canvas, type);
  if (KITCHEN_HOUSE_IDS.includes(type)) return drawKitchenHouse(canvas, type);
  return drawVehiclesColors(canvas, type);
}
