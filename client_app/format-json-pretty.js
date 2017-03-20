(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.formatJson = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

let formatJson = function(obj, space, num) {
  space = space || 2;
  num = num || space;
  let target = '{\n';
  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = obj[key];
    let blank = '';
    for (let i = 0; i < space; i++) {
      blank += ' ';
    }
    target += blank + `"${key}": `
    if (typeof value === 'string') {
      target += `"${value}"`
    }
    else if (value instanceof Array) {
      target += `${formatArray(value, space, num)}`;
    }
    else if (value instanceof Object) {
      target += `${formatJson(value, space + num, num)}`;
    }
    else {
      target += `${value}`
    }
    if (i !== keys.length - 1) {
      target += ',\n'
    }
  }
  let blank = ''
  for (let i = 0; i < space - num; i++) {
    blank += ' ';
  }
  target += '\n' + blank + '}';
  return target;

  function formatArray(arr, space, num) {
    space = space || 2;
    num = num || space;
    let target = '[';
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'string') {
        target += `"${arr[i]}"`;
      }
      else if (arr[i] instanceof Array) {
        target += `${formatArray(arr[i], space + num, num)}`;
      }
      else if (arr[i] instanceof Object) {
        target += `${formatJson(arr[i], space + num, num)}`;
      }
      else {
        target += `${arr[i]}`
      }
      if (i !== arr.length - 1) {
        target += ',';
      }
    }
    target += ']';
    return target;
  };
}

module.exports = formatJson;

},{}]},{},[1])(1)
});