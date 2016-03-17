var frames_template = [
  "What",
  ".",
  ".",
  ".",
  " is",
  " your ",
  -1,
  "?",
];

var set_question = function(topic) {
  var prompt = $("#prompt");
  var prompt_input = $("#prompt-input input");

  var frames = [];

  for (var i = 0; i < frames_template.length; i++) {
    if (frames_template[i] == -1) {
      frames.push(topic);
    } else {
      frames.push(frames_template[i]);
    }
  }

  prompt.text("");
  prompt_input.val("");
  prompt_input.prop('disabled', true);

  var frame = 0;
  var interval = setInterval(function() {
    if (frame >= frames.length) {
      clearInterval(interval);
      prompt_input.prop('disabled', false).focus();
      return;
    }
    prompt.text(prompt.text() + frames[frame]);
    frame += 1;
  }, 500);
}

var survey_done = function(user_num) {
  $("#prompt").text("Thanks for taking our survey!").append($("<br/>")).append("You were user number " + user_num);
  $("#prompt-input").hide();
}

var socket = new WebSocket("ws://" + document.location.host + "/ws");

$(function() {
  var question = "";
  var last = false;

  socket.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    if (msg["type"] == "question") {
      question = msg["topic"];
      last = msg["last"];
      set_question(msg["topic"]);
    } else if (msg["type"] == "got_answer") {
      survey_done(Math.floor(msg["row"][0] / 3))
    }
  };

  $("#prompt-input input").keyup(function(event) {
    if (event.keyCode != 13) { return; } // enter
    var answer = $(this).val();
    socket.send(JSON.stringify({"type": "answer", "answer": answer }));
    if (last) {
      socket.send(JSON.stringify({"type": "get_answer", "question": question, "answer": answer}));
    }
  });

});
