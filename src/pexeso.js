/*
	Pexeso (alias concentration game, pairs...)
	v1.1
	9.8.2014
	by http://codecanyon.net/user/ivanbohatyr
	url: alestrunda.cz/games/pexeso
	Copyright 2014 Ales Trunda - alestrunda.cz
*/

(function($) {
  "use strict";

  //default settings
  var defaults = {
    pieces: 10,
    players: 1,
    startPlayer: 1,
    pictures: [],
    switchOnPoint: false,
    waitForLoad: true,
    waitTime: 1500,
    squareDone: "cover",
    useCss: true,

    //callback functions
    onPlayerChange: function() {},
    onGameInit: function() {},
    onGameLoaded: function() {},
    onStep: function() {},
    onSolved: function() {},
    onTimerChange: function() {},
    onImgLoaded: function() {},
    onStatusChange: function() {}
  };

  $.fn.pexeso = function(options) {
    //game settings
    var game = {
      points: [],
      steps: [],
      timer: null,
      status: null,
      elapsedTime: 0,
      currentPlayer: 1,
      loader: 0
    };

    if (this.length == 0) return this;

    //support multiple elements
    if (this.length > 1) {
      this.each(function() {
        $(this).pexeso(options);
      });
      return this;
    }

    //make pexeso object
    var pexeso = {};
    var el = this;

    //init
    var init = function() {
      //merge set options and defaults
      pexeso.settings = $.extend({}, defaults, options);

      //check if used css styles are fully supported
      pexeso.useCSS = pexeso.settings.useCss && checkCssSupport();

      //check if settings are correct
      if (
        pexeso.settings.players < 1 ||
        pexeso.settings.players < pexeso.settings.startPlayer ||
        pexeso.settings.pieces < 1 ||
        pexeso.settings.pictures.length < pexeso.settings.pieces
      )
        return this;

      //init players points
      for (var i = 1; i <= pexeso.settings.players; i++) {
        game.points[i] = 0;
        game.steps[i] = 0;
      }

      game.currentPlayer = pexeso.settings.startPlayer;
      createPexesoStructure();
    };

    var checkCssSupport = function() {
      var testDiv = document.createElement("div");
      var cssTestProperties = {
        webkitTransformStyle: "-webkit-transform-style",
        MozTransformStyle: "-moz-transform-style",
        msTransformStyle: "-ms-transform-style",
        transformStyle: "transform-style"
      };
      for (var i in cssTestProperties) {
        if (testDiv.style[i] !== undefined) {
          testDiv.style[i] = "preserve-3d";
        }
      }
      for (var i in cssTestProperties) {
        if (testDiv.style[i] === "preserve-3d") {
          return true;
        }
      }
      return false;
    };

    //create pexeso structure
    var createPexesoStructure = function() {
      var containerClass = "pexeso-container";
      if (pexeso.useCSS) containerClass += " css-supported";
      else containerClass += " css-not-supported";
      containerClass += " pexeso-done-" + pexeso.settings.squareDone;

      el.append('<div class="' + containerClass + '">');
      for (var i = 0; i < pexeso.settings.pieces * 2; i++) {
        el.children(".pexeso-container").append(
          '<div class="pexeso-square-container"><div class="pexeso-square square-open pexeso-square-' +
            i +
            '"><div class="pexeso-edge"></div><div class="pexeso-empty"><div class="pexeso-content"></div></div><div class="pexeso-image"><div class="square-cover"></div><div class="pexeso-content"></div></div></div></div>'
        );
      }
      el.append("</div>");

      //shuffle pexeso squares
      var pictures = shuffle(pexeso.settings.pictures);
      pictures.slice(0, pexeso.settings.pieces.length);
      var squares = shuffle($(".pexeso-square"));

      //set pexeso images
      var counter = 0;
      squares.each(function() {
        var index = Math.floor(counter / 2);
        $(this)
          .children(".pexeso-image")
          .children(".pexeso-content")
          .css("background-image", 'url("' + pictures[index] + '")');
        counter++;
      });

      pexeso.settings.onGameInit(game.currentPlayer);

      //wait untill all game pictures are loaded
      if (pexeso.settings.waitForLoad) {
        for (var i = 0; i < pexeso.settings.pieces; i++) {
          var img = new Image();
          $(img).on("load", function() {
            imgLoader();
          });
          if ($(img).complete) {
            $(img).load();
          }
          img.src = pictures[i];
        }
      } else {
        runTimer();
        run();
      }
    };

    //picture loaded
    var imgLoader = function() {
      game.loader++;
      pexeso.settings.onImgLoaded(game.loader);
      if (game.loader == pexeso.settings.pieces) {
        pexeso.settings.onGameLoaded();
        runTimer();
        run();
      }
    };

    //run player interface
    var run = function() {
      setGameStatus("running");

      //set click function for squares
      el.find(".square-open").bind("click", function(e) {
        if (game.status != "running") {
          return false;
        }
        pause();
        e.preventDefault();

        var square = $(this);

        //continue when clicked on turned square
        if ($(this).hasClass("square-active")) {
          run();
          return;
        }

        square.addClass("square-active");
        square
          .parent(".pexeso-square-container")
          .addClass("pexeso-square-container-active");
        if (pexeso.useCSS) {
          square.bind(
            "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
            function() {
              square.unbind(
                "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"
              );
              checkSquares();
            }
          );
        } else {
          checkSquares();
        }
      });
    };

    //game timer run
    var runTimer = function() {
      if (game.timer) return;
      game.timer = setInterval(function() {
        game.elapsedTime++;
        pexeso.settings.onTimerChange(game.elapsedTime);
      }, 1000);
    };

    //timer stop
    var stopTimer = function() {
      window.clearInterval(game.timer);
      game.timer = null;
    };

    //check the choosen squares for match
    var checkSquares = function() {
      var squares = el.find(".square-active");
      if (squares.length != 2) {
        run();
        return;
      }

      //squares match
      if (
        $(squares.get(0))
          .children(".pexeso-image")
          .children(".pexeso-content")
          .css("background-image") ==
        $(squares.get(1))
          .children(".pexeso-image")
          .children(".pexeso-content")
          .css("background-image")
      ) {
        game.points[game.currentPlayer]++;
        if (pexeso.useCSS) {
          var elements = squares;
          switch (pexeso.settings.squareDone) {
            case "square":
              elements = squares.parent(".pexeso-square-container");
              break;
            case "cover":
              elements = squares.find(".square-cover");
              break;
          }
          squares
            .parent(".pexeso-square-container")
            .addClass("pexeso-square-container-done");
          squares.removeClass("square-open").addClass("square-done");
          elements.bind(
            "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",
            function() {
              elements.unbind(
                "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd"
              );
              clear();
            }
          );
        } else {
          setTimeout(function() {
            squares
              .parent(".pexeso-square-container")
              .addClass("pexeso-square-container-done");
            squares.removeClass("square-open").addClass("square-done");
            clear();
          }, pexeso.settings.waitTime);
        }
      }
      //squares do not match
      else {
        squares.addClass("square-wrong");
        if (pexeso.useCSS) {
          squares
            .find(".square-cover")
            .bind(
              "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",
              function() {
                squares
                  .find(".square-cover")
                  .unbind(
                    "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd"
                  );
                clear();
              }
            );
        } else {
          setTimeout(function() {
            clear();
          }, pexeso.settings.waitTime);
        }
      }
    };

    //stop player interface - click on squares
    var pause = function(status) {
      el.find(".square-open").unbind("click");
      if (!status) status = "processing";
      setGameStatus(status);
    };

    //check if game is solved, clear selected squares and switch player
    var clear = function() {
      //check is game is done
      if (getTotal("points") == pexeso.settings.pieces) {
        step(correctStep, false);
        finish();
        return;
      }

      var correctStep = true;
      if (el.find(".square-wrong").length == 2) correctStep = false;

      //clear squares and switch player
      var switchPlayer = true;
      if (
        pexeso.settings.switchOnPoint == false &&
        el.find(".square-wrong").length == 0
      )
        switchPlayer = false;
      var squares = el.find(".square-active");
      squares.removeClass("square-active square-wrong");
      if (pexeso.useCSS && !correctStep) {
        squares.bind(
          "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
          function() {
            squares.unbind(
              "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"
            );
            el.find(".pexeso-square-container-active").removeClass(
              "pexeso-square-container-active"
            );
            step(correctStep, switchPlayer);
          }
        );
      } else {
        el.find(".pexeso-square-container-active").removeClass(
          "pexeso-square-container-active"
        );
        step(correctStep, switchPlayer);
      }
    };

    //player step
    var step = function(correctStep, switchPlayer) {
      game.steps[game.currentPlayer]++;
      pexeso.settings.onStep(
        correctStep,
        getTotal("steps"),
        game.points[game.currentPlayer]
      );
      if (switchPlayer) nextPlayer();
      run();
    };

    //switch to next player
    var nextPlayer = function() {
      if (pexeso.settings.players == 1) return;
      game.currentPlayer++;
      if (game.currentPlayer > pexeso.settings.players) game.currentPlayer = 1;
      pexeso.settings.onPlayerChange(
        game.currentPlayer,
        game.points[game.currentPlayer]
      );
    };

    //game finished
    var finish = function() {
      stopTimer();
      setGameStatus("finished");
      pexeso.settings.onSolved(game.points);
    };

    //get total points of all players
    var getTotal = function(property) {
      var total = 0;
      for (var i = 1; i <= pexeso.settings.players; i++) {
        total += game[property][i];
      }
      return total;
    };

    var setGameStatus = function(status) {
      game.status = status;
      pexeso.settings.onStatusChange(status);
    };

    //stop the game and remove the structure
    el.destroy = function() {
      stopTimer();
      el.children(".pexeso-container").remove();
    };

    //pause timer and stop player interface
    el.pause = function() {
      if (game.status == "running") {
        pause("paused");
        stopTimer();
        return true;
      }
      return false;
    };

    //resume timer and reactive player interface
    el.resume = function() {
      if (game.status == "paused") {
        runTimer();
        run();
        return true;
      }
      return false;
    };

    //get game status
    el.getGameStatus = function() {
      return game.status;
    };

    //get array of players and points
    el.getPoints = function() {
      return game.points;
    };

    //get number of steps
    el.getTotalPoints = function() {
      return getTotal("points");
    };

    //get timer value
    el.getTimerValue = function() {
      return game.elapsedTime;
    };

    //get array of steps and points
    el.getSteps = function() {
      return game.steps;
    };

    //get number of steps
    el.getTotalSteps = function() {
      return getTotal("steps");
    };

    //get number of current player
    el.getCurrentPlayer = function() {
      return game.currentPlayer;
    };

    init();
    return this;
  };

  //shuffle squares
  function shuffle(o) {
    for (
      var j, x, i = o.length;
      i;
      j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
    );
    return o;
  }
})(jQuery);
