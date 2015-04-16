/* jshint node: true */
/* global io, Hammer */
'use strict';

var touchElem = document.getElementById('touchpad');
var socket = io();
var delta = null;
var moving = false;

var pos = {x: 0, y: 0, cmd: null};
/**
 * pass `pos` object to socket.emit('mouse', pos) function
 *
 * {Object} pos
 * {integer} pos.x mouse x offset
 * {integer} pos.y mouse y offset
 * {string} pos.cmd key command or mouse click (not implemented yet)
 */
var emitMouse = function(x, y, cmd) {
  pos.x = x;
  pos.y = y;
  pos.cmd = cmd;

  socket.emit('mouse', pos);
};

// receive msg
//socket.on('mouse', function(msg) {
//console.log(msg);
//console.info(msg.x + ',' + msg.y);
//});

var handlePan = function(eventName, e) {
  if (e.type == eventName + 'start') {
    delta = null;
    moving = true;
    console.log('start ' + eventName);
    emitMouse(0, 0, eventName + 'start');
  }
  if (e.type == eventName + 'end') {
    delta = null;
    moving = false;
    emitMouse(0, 0, eventName + 'end');
  }
  if (moving && delta != null) {
    emitMouse(e.deltaX - delta.x, e.deltaY - delta.y, eventName);
  }
  delta = {x: e.deltaX, y: e.deltaY};
};

var mc = new Hammer.Manager(touchElem);
mc.add(new Hammer.Pan({event: 'move', threshold: 0, pointers: 1,
  direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 2,
  direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'drag', threshold: 0, pointers: 3,
  direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Tap({event: 'click', pointers: 1}));
mc.add(new Hammer.Tap({event: 'rightclick', pointers: 2}));
mc.on('movestart moveend moveup movedown moveleft moveright', function(e) {
  handlePan('move', e);
});
mc.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
  });
mc.on('dragstart dragend dragup dragdown dragleft dragright', function(e) {
  handlePan('drag', e);
});
mc.on('click', function(e) {
  console.info('click');
  emitMouse(0, 0, 'click');
});
mc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});

