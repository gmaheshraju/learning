/* Coloured shapes drawn as SVG. Emoji colours differ between Apple, Google and
   Microsoft, so anything a child must sort or match by colour uses these. */
(function () {
  'use strict';

  var COLORS = {
    red: { fill: '#E53935', dark: '#A31515', name: 'red', te: 'ఎరుపు' },
    blue: { fill: '#1E88E5', dark: '#0D47A1', name: 'blue', te: 'నీలం' },
    yellow: { fill: '#FDD835', dark: '#B88A00', name: 'yellow', te: 'పసుపు' },
    green: { fill: '#43A047', dark: '#1B5E20', name: 'green', te: 'ఆకుపచ్చ' },
    purple: { fill: '#8E24AA', dark: '#4A148C', name: 'purple', te: 'ఊదా' },
    orange: { fill: '#FB8C00', dark: '#B35F00', name: 'orange', te: 'నారింజ' }
  };

  function starPath() {
    var d = '';
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 45;
      d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1);
    }
    return d + 'Z';
  }

  var SHAPES = {
    circle: { name: 'circle', plural: 'circles', te: 'వృత్తం', d: '<circle r="40"/>' },
    square: { name: 'square', plural: 'squares', te: 'చతురస్రం', d: '<rect x="-36" y="-36" width="72" height="72" rx="8"/>' },
    triangle: { name: 'triangle', plural: 'triangles', te: 'త్రికోణం', d: '<path d="M0-41 43 35H-43Z"/>' },
    star: { name: 'star', plural: 'stars', te: 'నక్షత్రం', d: '<path d="' + starPath() + '"/>' },
    heart: { name: 'heart', plural: 'hearts', te: 'హృదయం', d: '<path d="M0 38C-30 16-44 2-44-16-44-32-32-42-19-42-10-42-3-37 0-30 3-37 10-42 19-42 32-42 44-32 44-16 44 2 30 16 0 38Z"/>' }
  };

  // shape: key of SHAPES, color: key of COLORS (or 'grey'), scale: 1 = full size
  function svg(shape, color, scale) {
    var c = COLORS[color] || { fill: '#B0BEC5', dark: '#546E7A' };
    var k = scale || 1;
    return '<svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">' +
      '<g transform="scale(' + k + ')" fill="' + c.fill + '" stroke="' + c.dark + '" stroke-width="5" stroke-linejoin="round">' + SHAPES[shape].d + '</g>' +
      '<ellipse cx="' + (-10 * k) + '" cy="' + (-13 * k) + '" rx="' + (8 * k) + '" ry="' + (5 * k) + '" fill="#fff" opacity=".4"/></svg>';
  }

  window.Shapes = { COLORS: COLORS, SHAPES: SHAPES, svg: svg };
})();
