$(document).ready(function(e) {
  $(".show-more").click(function(e) {
    $(this).hide();
    $("#" + $(this).data("show")).show();
  });

  //write text input based on range
  function writeRangeInput(input_el, write_el) {
    if (write_el) write_el.val(input_el.val());
  }

  //adjust fields range based on max a min values picture type has
  function adjustPiecesRange(el) {
    $("#pieces-range").attr("max", el.data("max"));
    $("#pieces-range").attr("min", el.data("min"));
    writeRangeInput($("#pieces-range"), $("#pieces-value"));
  }

  //write default values from ranges
  writeRangeInput($("#pieces-range"), $("#pieces-value"));
  writeRangeInput($("#players-range"), $("#players-value"));

  //write values from ranges when range changes
  $("#pieces-range").on("change input", function() {
    writeRangeInput($(this), $("#pieces-value"));
  });
  $("#players-range").on("change input", function() {
    writeRangeInput($(this), $("#players-value"));
  });

  //adjust pieces range based on max a min values picture type has
  adjustPiecesRange($("#image-class :selected"));
  $("#image-class").change(function(e) {
    adjustPiecesRange($(this).find(":selected"));
  });
});
