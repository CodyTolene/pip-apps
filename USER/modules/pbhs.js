function pbhs() {
  this.scoreLoc = '/USER/hiscores.json';
  this.scoreDict = null;
}

pbhs.prototype.saveScoreFile = function () {
  this.checkFile();
  try {
    let s = JSON.stringify(this.scoreDict);
    fs.writeFile(this.scoreLoc, s);
  } catch (e) {
    console.log('Failed to save scores file', e);
  }
};

pbhs.prototype.loadScoresFromFile = function () {
  this.checkFile();
  try {
    let f = fs.readFileSync(this.scoreLoc);
    this.scoreDict = JSON.parse(f);
    for (const s of this.scoreDict) {
      s.scores.sort(function (a, b) {
        return a - b;
      });
    }
  } catch (e) {
    console.log('Failed to read high scores', e);
  }
};

/*returns true if high score was added successfully, false if not.*/
pbhs.prototype.addHighScore = function (gameName, score) {
  this.checkFile();
  try {
    let found = false;
    for (const s of this.scoreDict) {
      if (s.game == gameName) {
        found = true;
        s.scores.push(score);
        s.scores = s.scores.sort();
        break;
      }
    }
    if (!found) {
      this.scoreDict.push({ game: gameName, scores: [score] });
    }
    this.saveScoreFile();
    return true;
  } catch (e) {
    console.log('Failed to add high score', e);
    return false;
  }
};

/* returns an array of scores for the game requested, sorted largest score first.*/
pbhs.prototype.readHighScores = function (gameName) {
  if (!this.scoreDict) {
    this.loadScoresFromFile();
  }
  try {
    let found = false;
    for (const s of this.scoreDict) {
      if (s.game == gameName) {
        found = true;
        return s.scores;
      }
    }
    if (!found) {
      return [];
    }
  } catch (e) {
    return [];
  }
};

pbhs.prototype.checkFile = function () {
  try {
    fs.readFile(this.scoreLoc);
  } catch (e) {
    //file doesn't exist, create
    fs.writeFile(this.scoreLoc, '[]');
  }
};

exports.initPipboyHighScores = function () {
  return new pbhs();
};
