/**
 * QR Code Generator — based on proven qrcode-generator algorithm
 * Byte mode only, EC level M
 */
(function(root){
"use strict";

var PAD0 = 0xEC, PAD1 = 0x11;

function utf8Bytes(str) {
  var s = String(str);
  var bytes = [];
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) { bytes.push(0xc0|(c>>6)); bytes.push(0x80|(c&0x3f)); }
    else { bytes.push(0xe0|(c>>12)); bytes.push(0x80|((c>>6)&0x3f)); bytes.push(0x80|(c&0x3f)); }
  }
  return bytes;
}

function utf8BytesLength(str) {
  var s = String(str);
  var bytes = 0;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else bytes += 3;
  }
  return bytes;
}

function QR(typeNumber, ecLevel) {
  var _typeNumber = typeNumber;
  var _errorCorrectLevel = ecLevel;
  var _modules = null;
  var _moduleCount = 0;
  var _dataCache = null;
  var _dataList = [];

  this.addData = function(data) {
    _dataList.push({data:String(data), mode:4});
    _dataCache = null;
  };

  this.make = function() {
    if (_typeNumber < 1) {
      var typeNumber = 1;
      for (; typeNumber < 40; typeNumber++) {
        var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectLevel);
        var buffer = QRBitBuffer();
        var totalDataCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
        for (var i = 0; i < _dataList.length; i++) {
          var data = _dataList[i];
          buffer.put(data.mode, 4);
          var dataLength = utf8BytesLength(data.data);
          buffer.put(dataLength, QRUtil.getLengthInBits(data.mode, typeNumber));
          buffer.putBytes(utf8Bytes(data.data));
        }
        var totalBits = totalDataCount * 8;
        if (buffer.getLengthInBits() <= totalBits) break;
      }
      _typeNumber = typeNumber;
    }
    makeImpl(false, getBestMask());
  };

  this.getModuleCount = function() { return _moduleCount; };
  this.isDark = function(row, col) {
    if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) throw new Error(row + "," + col);
    return _modules[row][col];
  };

  function makeImpl(test, maskPattern) {
    _moduleCount = _typeNumber * 4 + 17;
    _modules = new Array(_moduleCount);
    for (var row = 0; row < _moduleCount; row++) {
      _modules[row] = new Array(_moduleCount);
      for (var col = 0; col < _moduleCount; col++) {
        _modules[row][col] = null;
      }
    }
    setupPositionProbePattern(0, 0);
    setupPositionProbePattern(_moduleCount - 7, 0);
    setupPositionProbePattern(0, _moduleCount - 7);
    setupPositionAdjustPattern();
    setupTimingPattern();
    setupTypeInfo(test, maskPattern);
    if (_typeNumber >= 7) setupTypeNumber(test);
    if (_dataCache == null) {
      _dataCache = QRUtil.createData(_typeNumber, _errorCorrectLevel, _dataList);
    }
    mapData(_dataCache, maskPattern);
  }

  function setupPositionProbePattern(row, col) {
    for (var r = -1; r <= 7; r++) {
      if (row + r <= -1 || _moduleCount <= row + r) continue;
      for (var c = -1; c <= 7; c++) {
        if (col + c <= -1 || _moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          _modules[row + r][col + c] = true;
        } else {
          _modules[row + r][col + c] = false;
        }
      }
    }
  }

  function getBestMask() {
    var minLostPoint = 0;
    var pattern = 0;
    for (var i = 0; i < 8; i++) {
      makeImpl(true, i);
      var lostPoint = QRUtil.getLostPoint(_modules, _moduleCount);
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  }

  function setupPositionAdjustPattern() {
    var pos = QRUtil.getPatternPosition(_typeNumber);
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var row = pos[i], col = pos[j];
        if (_modules[row][col] != null) continue;
        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              _modules[row + r][col + c] = true;
            } else {
              _modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  function setupTimingPattern() {
    for (var r = 8; r < _moduleCount - 8; r++) {
      if (_modules[r][6] != null) continue;
      _modules[r][6] = (r % 2 == 0);
    }
    for (var c = 8; c < _moduleCount - 8; c++) {
      if (_modules[6][c] != null) continue;
      _modules[6][c] = (c % 2 == 0);
    }
  }

  function setupTypeNumber(test) {
    var bits = QRUtil.getBCHTypeNumber(_typeNumber);
    for (var i = 0; i < 18; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
    }
    for (var i = 0; i < 18; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  function setupTypeInfo(test, maskPattern) {
    var data = (_errorCorrectLevel << 3) | maskPattern;
    var bits = QRUtil.getBCHTypeInfo(data);
    for (var i = 0; i < 15; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 6) { _modules[i][8] = mod; }
      else if (i < 8) { _modules[i + 1][8] = mod; }
      else { _modules[_moduleCount - 15 + i][8] = mod; }
    }
    for (var i = 0; i < 15; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 8) { _modules[8][_moduleCount - i - 1] = mod; }
      else if (i < 9) { _modules[8][15 - i - 1 + 1] = mod; }
      else { _modules[8][15 - i - 1] = mod; }
    }
    _modules[_moduleCount - 8][8] = (!test);
  }

  function mapData(data, maskPattern) {
    var inc = -1;
    var row = _moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    var maskFunc = QRUtil.getMaskFunction(maskPattern);
    for (var col = _moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;
      while (true) {
        for (var c = 0; c < 2; c++) {
          if (_modules[row][col - c] == null) {
            var dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }
            var mask = maskFunc(row, col - c);
            if (mask) { dark = !dark; }
            _modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || _moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  this.createSvgTag = function(cellSize, margin) {
    cellSize = cellSize || 2;
    margin = (typeof margin == "undefined") ? cellSize * 4 : margin;
    var size = _moduleCount * cellSize + margin * 2;
    var rects = '';
    for (var r = 0; r < _moduleCount; r++) {
      for (var c = 0; c < _moduleCount; c++) {
        if (this.isDark(r, c)) {
          rects += '<rect x="' + (c * cellSize + margin) + '" y="' + (r * cellSize + margin) + '" width="' + cellSize + '" height="' + cellSize + '" fill="#000"/>';
        }
      }
    }
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg"><rect width="' + size + '" height="' + size + '" fill="#fff"/>' + rects + '</svg>';
  };

  this.drawToCanvas = function(canvas, cellSize, margin) {
    cellSize = cellSize || 4;
    margin = margin || cellSize * 4;
    var size = _moduleCount * cellSize + margin * 2;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000";
    for (var r = 0; r < _moduleCount; r++) {
      for (var c = 0; c < _moduleCount; c++) {
        if (this.isDark(r, c)) {
          ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);
        }
      }
    }
  };
}

function QRUtil() {}

QRUtil.PATTERN_POSITION_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
];

QRUtil.G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
QRUtil.G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
QRUtil.G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

QRUtil.getBCHTypeInfo = function(data) {
  var d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(QRUtil.G15) >= 0) {
    d ^= (QRUtil.G15 << (getBCHDigit(d) - getBCHDigit(QRUtil.G15)));
  }
  return ((data << 10) | d) ^ QRUtil.G15_MASK;
};

QRUtil.getBCHTypeNumber = function(data) {
  var d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(QRUtil.G18) >= 0) {
    d ^= (QRUtil.G18 << (getBCHDigit(d) - getBCHDigit(QRUtil.G18)));
  }
  return (data << 12) | d;
};

QRUtil.getPatternPosition = function(typeNumber) {
  return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
};

QRUtil.getMaskFunction = function(maskPattern) {
  switch (maskPattern) {
    case 0: return function(i, j) { return (i + j) % 2 == 0; };
    case 1: return function(i, j) { return i % 2 == 0; };
    case 2: return function(i, j) { return j % 3 == 0; };
    case 3: return function(i, j) { return (i + j) % 3 == 0; };
    case 4: return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0; };
    case 5: return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
    case 6: return function(i, j) { return ((i * j) % 2 + (i * j) % 3) % 2 == 0; };
    case 7: return function(i, j) { return ((i + j) % 2 + (i * j) % 3) % 2 == 0; };
    default: throw new Error("bad maskPattern:" + maskPattern);
  }
};

QRUtil.getLengthInBits = function(mode, type) {
  if (1 <= type && type < 10) return [0, 10, 9, 8, 8][mode];
  else if (type < 27) return [0, 12, 11, 16, 10][mode];
  else if (type < 41) return [0, 14, 13, 16, 12][mode];
  else throw new Error("type:" + type);
};

QRUtil.getErrorCorrectPolynomial = function(errorCorrectLength) {
  var a = new QRPolynomial([1], 0);
  for (var i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
  }
  return a;
};

QRUtil.getLostPoint = function(modules, moduleCount) {
  var point = 0;
  for (var row = 0; row < moduleCount; row++) {
    for (var col = 0; col < moduleCount; col++) {
      var sameCount = 0;
      var dark = modules[row][col];
      for (var r = -1; r <= 1; r++) {
        if (row + r < 0 || moduleCount <= row + r) continue;
        for (var c = -1; c <= 1; c++) {
          if (col + c < 0 || moduleCount <= col + c) continue;
          if (r == 0 && c == 0) continue;
          if (dark == modules[row + r][col + c]) sameCount++;
        }
      }
      if (sameCount > 5) point += (3 + sameCount - 5);
    }
  }
  for (var row = 0; row < moduleCount - 1; row++) {
    for (var col = 0; col < moduleCount - 1; col++) {
      var count = 0;
      if (modules[row][col]) count++;
      if (modules[row + 1][col]) count++;
      if (modules[row][col + 1]) count++;
      if (modules[row + 1][col + 1]) count++;
      if (count == 0 || count == 4) point += 3;
    }
  }
  return point;
};

QRUtil.createData = function(typeNumber, errorCorrectLevel, dataList) {
  var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
  var buffer = QRBitBuffer();
  for (var i = 0; i < dataList.length; i++) {
    var data = dataList[i];
    var bytes = utf8Bytes(data.data);
    buffer.put(data.mode, 4);
    buffer.put(bytes.length, QRUtil.getLengthInBits(data.mode, typeNumber));
    buffer.putBytes(bytes);
  }
  var totalDataCount = 0;
  for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
  }
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
  while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false);
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD1, 8);
  }
  return QRUtil.createBytes(buffer, rsBlocks);
};

QRUtil.createBytes = function(buffer, rsBlocks) {
  var offset = 0;
  var maxDcCount = 0;
  var maxEcCount = 0;
  var dcdata = new Array(rsBlocks.length);
  var ecdata = new Array(rsBlocks.length);
  for (var r = 0; r < rsBlocks.length; r++) {
    var dcCount = rsBlocks[r].dataCount;
    var ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);
    for (var i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
    offset += dcCount;
    var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
    var modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (var i = 0; i < ecdata[r].length; i++) {
      var modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
    }
  }
  var totalCodeCount = 0;
  for (var i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
  var data = new Array(totalCodeCount);
  var index = 0;
  for (var i = 0; i < maxDcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        data[index] = dcdata[r][i];
        index++;
      }
    }
  }
  for (var i = 0; i < maxEcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        data[index] = ecdata[r][i];
        index++;
      }
    }
  }
  return data;
};

function getBCHDigit(data) {
  var digit = 0;
  while (data != 0) { digit++; data >>>= 1; }
  return digit;
}

function QRMath() {}
QRMath.GLOG = new Array(256);
QRMath.GEXP = new Array(256);
(function() {
  var x = 1;
  for (var i = 0; i < 255; i++) {
    QRMath.GEXP[i] = x;
    QRMath.GLOG[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
  QRMath.GEXP[255] = QRMath.GEXP[0];
})();
QRMath.glog = function(n) {
  if (n < 1) throw new Error("glog(" + n + ")");
  return QRMath.GLOG[n];
};
QRMath.gexp = function(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return QRMath.GEXP[n];
};

function QRPolynomial(num, shift) {
  if (typeof num.length == "undefined") throw new Error(num.length + "/" + shift);
  var _num = (function() {
    var offset = 0;
    while (offset < num.length && num[offset] == 0) offset++;
    var _num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) _num[i] = num[i + offset];
    return _num;
  })();
  this.getAt = function(index) { return _num[index]; };
  this.getLength = function() { return _num.length; };
  this.multiply = function(e) {
    var num = new Array(this.getLength() + e.getLength() - 1);
    for (var i = 0; i < this.getLength(); i++) {
      for (var j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }
    return new QRPolynomial(num, 0);
  };
  this.mod = function(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    var ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));
    var num = new Array(this.getLength());
    for (var i = 0; i < this.getLength(); i++) num[i] = this.getAt(i);
    for (var i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  };
}

function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount;
  this.dataCount = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [
  [1,26,19],[1,26,16],[1,26,13],[1,26,9],
  [1,44,34],[1,44,28],[1,44,22],[1,44,16],
  [1,70,55],[1,70,44],[2,35,17],[2,35,13],
  [1,100,80],[2,50,32],[2,50,24],[4,25,9],
  [1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],
  [2,86,68],[4,43,27],[4,43,19],[4,43,15],
  [2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],
  [2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],
  [2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],
  [2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
  var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);
  if (typeof rsBlock == "undefined") throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
  var length = rsBlock.length / 3;
  var list = [];
  for (var i = 0; i < length; i++) {
    var count = rsBlock[i * 3 + 0];
    var totalCount = rsBlock[i * 3 + 1];
    var dataCount = rsBlock[i * 3 + 2];
    for (var j = 0; j < count; j++) list.push(new QRRSBlock(totalCount, dataCount));
  }
  return list;
};

function getRsBlockTable(typeNumber, errorCorrectLevel) {
  switch (errorCorrectLevel) {
    case 1: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
    case 0: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
    case 3: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
    case 2: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
    default: throw new Error("errorCorrectLevel:" + errorCorrectLevel);
  }
}

function QRBitBuffer() {
  var _buffer = [];
  var _length = 0;
  return {
    getBuffer: function() { return _buffer; },
    getAt: function(index) { return ((_buffer[Math.floor(index / 8)] >>> (7 - index % 8)) & 1) == 1; },
    put: function(num, length) { for (var i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) == 1); },
    getLengthInBits: function() { return _length; },
    putBit: function(bit) {
      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) _buffer.push(0);
      if (bit) _buffer[bufIndex] |= (0x80 >>> (_length % 8));
      _length++;
    },
    putBytes: function(bytes) {
      for (var i = 0; i < bytes.length; i++) this.put(bytes[i], 8);
    }
  };
}

// Error correction levels: 1=M, 0=L, 3=H, 2=Q
function createQR(text, ecLevel) {
  ecLevel = ecLevel || 1;
  var qr = new QR(-1, ecLevel);
  qr.addData(text);
  qr.make();
  var size = qr.getModuleCount();
  var modules = [];
  for (var r = 0; r < size; r++) {
    modules[r] = [];
    for (var c = 0; c < size; c++) {
      modules[r][c] = qr.isDark(r, c);
    }
  }
  return { modules: modules, size: size };
}

root.QRCode = { generate: createQR };

})(typeof window !== "undefined" ? window : globalThis);
