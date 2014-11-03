/**
 * Blockly Games: Pattern
 *
 * Copyright 2013 Google Inc.
 * https://blockly-games.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Pattern application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Pattern');

goog.require('Pattern.soy');
goog.require('Pattern.Blocks');
goog.require('BlocklyGames');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Line');


BlocklyGames.NAME = 'pattern';

/**
 * Number of characters on each row.
 */
Pattern.CHAR_PER_ROW = 10;

/**
 * Rows of characters.
 */
Pattern.NUM_ROWS = 10;

/**
 * The Character(s) reserved for removed characters.
 */
Pattern.REMOVED_CHAR_SYMBOL = ' '; // ASCII 32.

/**
 * Set the minimum ASCII character to use.
 */
Pattern.minChar = 65;

/**
 * Set the maximum ASCII character to use.
 */
Pattern.maxChar = 90;

/**
 * Represents each row in the display.
 * @type {Array.<string>}
 */
Pattern.rowArray = [];

/**
 * A string of all symbols, digits, and letters allowed in the game.
 * Generated from the ASCII table.
 */
Pattern.POSSIBLE_ASCII_CHARACTERS = '';

/**
 * Create an string of characters from the ASCII table.
 * @param {number} length The length of the string.
 * @param {number=} min The lower bound ASCII code to use.
 * @param {number=} max The upper bound ASCII code to use (exclusive).
 * @return {string} The generated character String.
 */
Pattern.createCharacterString = function(length, min, max) {
  var charArray = [];
  var stringLength = length || 0;
  var minStringChar = min || Pattern.minChar;
  var maxStringChar = max || Pattern.maxChar;
  if (Pattern.POSSIBLE_ASCII_CHARACTERS) {
    for (var c = 0; c < stringLength; c++) {
      charArray.push(Pattern.generateCharacter());
    }
  } else {
    for (var c = min; c < max; c++) {
      charArray.push(String.fromCharCode(c));
    }
  }
  return charArray.join('');
};

/**
 * A string of all symbols, digits, and letters allowed in the game.
 * Generated from the ASCII table.
 */
Pattern.POSSIBLE_ASCII_CHARACTERS =
    Pattern.createCharacterString((Pattern.CHAR_PER_ROW *
        Pattern.NUM_ROWS), Pattern.minChar, Pattern.maxChar);

/**
 * Generate a single pseudo-randomly generated character for the display.
 * TODO: Eventually the character could be generated by various methods
 * e.g. biased, weighted, etc.
 * @return {string} character A single character.
 */
Pattern.generateCharacter = function() {
  var character = Pattern.POSSIBLE_ASCII_CHARACTERS.charAt(Math.floor(
      Math.random() * Pattern.POSSIBLE_ASCII_CHARACTERS.length));
  return character;
};

// The default value for blocks with a literal value.
Pattern.defaultLiteralValue = Pattern.generateCharacter();

/**
 * Wrap each of the characters in each row of Pattern.rowArray in an element,
 * add classes and an id to indicate its row and column location
 * then and add it to the character display.
 */
Pattern.generateCharDisplay = function() {
  var charDisplayDiv = document.getElementById('charDisplay');
  // Clear any existing HTML.
  charDisplayDiv.innerHTML = '';
  for (var row = 0; row < Pattern.NUM_ROWS; row++) {
    if (!Pattern.rowArray[row]) {
      // Fill any empty rows with a string of generated characters.
      Pattern.rowArray[row] =
          Pattern.createCharacterString(Pattern.CHAR_PER_ROW);
    }
    for (var col = 0; col < Pattern.CHAR_PER_ROW; col++) {
      var el = document.createElement('DIV');
      // Add the row specific class name and the overall 'char' class.
      el.className = 'r' + row + ' char';
      // All ids are of the form char_nn where nn is a two digit row number.
      el.id = 'char_' + ('0' + ((row * Pattern.CHAR_PER_ROW) + col)).slice(-2);
      var tempTextNode = document.createTextNode(Pattern.rowArray[row][col]);
      el.appendChild(tempTextNode);
      charDisplayDiv.appendChild(el);
      var padding = 40;
      var offset = 10;
      el.style.top = (row * padding) + 'px';
      el.style.left = (col * padding) + offset + 'px';
    }
  }
};

/**
 * Generate horizontal lines for the Character Display.
 * This is a visual aid and clarifies for the user that only horizontal matches
 * are allowed.
 */
Pattern.generateHorizontalLines = function() {
  var paddingBetweenLines = 30;
  var displayLinesParent = document.getElementById('displayLines');
  for (var row = 0; row < Pattern.NUM_ROWS; row++) {
    var tempHorizontalLine = document.createElement('HR');
    tempHorizontalLine.style.top = (paddingBetweenLines * row) + 'px';
    tempHorizontalLine.style.position = row ? 'relative' : 'absolute';
    displayLinesParent.appendChild(tempHorizontalLine);
  }
};

/**
 * Change literal block letter.
 * @param {Object} block A block of type re_literal.
 */
Pattern.changeLiteralBlockValue = function(block) {
  block.setFieldValue(Pattern.generateCharacter(), 're_literal');
};


/**
 * Initialize Blockly and the character display.  Called on page load.
 */
Pattern.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Pattern.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : '420px';
    blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
  };
  window.addEventListener('scroll', function() {
      onresize();
      Blockly.fireUiEvent(window, 'resize');
    });
  window.addEventListener('resize', onresize);
  onresize();

  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('blockly'),
      {'path': './',
       'rtl': rtl,
       'toolbox': toolbox,
       'trashcan': true});
  Blockly.loadAudio_(['pattern/whack.mp3', 'pattern/whack.ogg'], 'whack');
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  BlocklyGames.checkTimeout();\n';

  var defaultXml =
      '<xml>' +
      '  <block type="regex_constructor" x="70" y="70"></block>' +
      '</xml>';

  BlocklyInterface.loadBlocks(defaultXml, false);
  Pattern.generateCharDisplay();
  Pattern.generateHorizontalLines();

  BlocklyGames.bindClick('runButton', Pattern.runButtonClick);

  // Lazy-load the syntax-highlighting.
  setTimeout(BlocklyInterface.importPrettify, 1);
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', function() {
    BlocklyInterface.initReadonly(Pattern.readonly());
  });
} else {
  window.addEventListener('load', Pattern.init);
}

/**
 * Re-enable the run button and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Pattern.reset = function(first) {
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  document.getElementById('regexInput').value = '';
};

/**
 * Click the run button.  Start the program.
 */
Pattern.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  runButton.disabled = true;
  Blockly.mainWorkspace.traceOn(true);
  Pattern.execute();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Pattern.execute = function() {
  BlocklyGames.log = [];
  BlocklyGames.ticks = 10000;
  /**
   * TODO push to the animation queue and remove the setTimeouts.
   */
  var matchLocations = Pattern.getMatches();
  if (matchLocations.length) {
    Pattern.highlightMatches(matchLocations);
    setTimeout(function() {
      Pattern.removeCharacters(matchLocations);
      Pattern.removeHighlighting();
      Pattern.generateCharDisplay();
      Pattern.shiftCharacters(matchLocations);
      Pattern.arrayShift();
      Pattern.replaceCharacters();
    }, 1000);
    setTimeout(function() {
      Pattern.generateCharDisplay();
      Pattern.reset(false);
    }, 2000);
  } else {
    Blockly.playAudio('whack', 0.5);
    Pattern.reset(false);
  }
};

/**
 * Get elements inside the character display.
 * @return {Array.<Object>}
 */
Pattern.getCharDisplayElements = function() {
  return document.getElementById('charDisplay').childNodes;
};

/**
 * Find in each row, all of the matches and store their locations in an object.
 * @return {Object<Array<number>>} matchIndexes The rows and columns of
 * each match.
 */
Pattern.getMatches = function() {
  // Get the user's pattern.
  var userRegexString = Blockly.JavaScript.workspaceToCode();
  document.getElementById('regexInput').innerHTML = userRegexString;
  var userRegex = new RegExp(userRegexString, 'g');
  var matchLocations = [];
  for (var row = 0; row < Pattern.rowArray.length; row++) {
    var column, match = 0;
    while (match = userRegex.exec(Pattern.rowArray[row])) {
      column = match.index;
      for (var m = 0; m < match[0].length; m++) {
        matchLocations.push([row, column]);
        column++;
      }
    }
  }
  return matchLocations;
};

/**
 * Highlight the matches.
 * @param {Object.<number, number>} matchIndexes The rows and columns where each
 * match begins.
 */
Pattern.highlightMatches = function(matchIndexes) {
  for (var i = 0; i < matchIndexes.length; i++) {
    var characterId = Pattern.elementLocation(matchIndexes[i]);
    var matchChar = document.getElementById(characterId);
    matchChar.className += ' matchedChar';
  }
};

/**
 * Remove matched characters from Pattern.rowArray and replace them with
 * the Pattern.REMOVED_CHAR_SYMBOL.
 * @param {Object.<number, number>} matchIndexes The rows and columns where each
 * match begins.
 */
Pattern.removeCharacters = function(matchIndexes) {
  for (var i = 0, location; location = matchIndexes[i]; i++) {
    var row = location[0];
    var col = location[1];
    var match = Pattern.rowArray[row][col];
    Pattern.rowArray[row] = Pattern.rowArray[row]
        .replace(match, Pattern.REMOVED_CHAR_SYMBOL);
  }
};

/**
 * Move the char elements above the removed character down to fill in the gaps.
 * @param {Object.<number, number>} matchIndexes The rows and columns where each
 * gap is.
 */
Pattern.shiftCharacters = function(matchIndexes) {
  var finishedColumns = [];
  var translateAmount = 40;
  var numTranslations = 1;
  for (var i = matchIndexes.length - 1, location;
       location = matchIndexes[i]; i--) {
    // Check if this column has already been shifted.
    if (finishedColumns.indexOf(location[1]) == -1) {
      for (var row = location[0] - 1; row >= 0; row--) {
        var rowChar = Pattern.rowArray[row][location[1]];
        if (rowChar == Pattern.REMOVED_CHAR_SYMBOL) {
          numTranslations += 1;
        } else {
          // Shift the element down by an amount equal to the number of rows.
          var charId = 'char_' + row + location[1];
          var el = document.getElementById(charId);
          var translationString = 'translateY(' +
              (numTranslations * translateAmount) + 'px)';
          el.style.webkitTransform = translationString;
        }
      }
      // Reset the number of translations.
      numTranslations = 1;
      // Add this column to the record of finished columns.
      finishedColumns.push(location[1]);
    }
  }
};

/**
 * Shifts characters down in the Pattern.rowArray to match the display.
 */
Pattern.arrayShift = function() {
  // Iterating through multiple times to catch multiple removed characters.
  for (var i = Pattern.NUM_ROWS; i > 0; i--) {
    for (var row = Pattern.NUM_ROWS - 1; row > 0; row--) {
      /**
       * Strings are immutable so split, modify, and rejoin.
       * tempArrayTo is the array to replace.
       * tempArrayFrom is the array above to shift characters down from.
       */
      var tempArrayTo = Pattern.rowArray[row].split('');
      var tempArrayFrom = Pattern.rowArray[row - 1].split('');
      for (var col = 0; col < tempArrayTo.length; col++) {
        if (tempArrayTo[col] == Pattern.REMOVED_CHAR_SYMBOL) {
          // Replace the character above with the removed character.
          tempArrayTo[col] = tempArrayFrom[col];
          tempArrayFrom[col] = Pattern.REMOVED_CHAR_SYMBOL;
        }
      }
      Pattern.rowArray[row] = tempArrayTo.join('');
      Pattern.rowArray[row - 1] = tempArrayFrom.join('');
    }
  }
};

/**
 * Given a row and column, returns the id of the element.
 * @param {Object.<number, number>} location The row and column of a single
 * character.
 * @return {string} The id of the element located at the given row and column.
 */
Pattern.elementLocation = function(location) {
  return 'char_' + ('0' + ((location[0] * Pattern.NUM_ROWS) + location[1]))
      .slice(-2);
};

/**
 * Replaces all removed characters in Pattern.rowArray.
 */
Pattern.replaceCharacters = function() {
  for (var row = 0; row < Pattern.NUM_ROWS; row++) {
    var tempArray = Pattern.rowArray[row].split('');
    for (var col = 0; col < tempArray.length; col++) {
      if (tempArray[col] == Pattern.REMOVED_CHAR_SYMBOL) {
        tempArray[col] = Pattern.generateCharacter();
      }
    }
    Pattern.rowArray[row] = tempArray.join('');
  }
};

/**
 * Remove highlighting from characters elements by removing all class names
 * except for the row number.
 */
Pattern.removeHighlighting = function() {
  var classToRemove = 'matchedChar';
  var re = new RegExp('\s' + classToRemove);
  var charDisplayHTML = Pattern.getCharDisplayElements();
  for (var i = 0, element; element = charDisplayHTML[i]; i++) {
    element.className = element.className.replace(re, '');
  }
};
