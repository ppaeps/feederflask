var feeder;
var r;

function loadPetKitData() {
    $.getJSON("get-data")
    .fail(function(xhr, status, errorThrown) {
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
        console.dir(xhr);
        $('#nextFeeding').text('⚠️');
        $('#nextFeeding').removeClass('opacity-50');
        $('#replaceDesiccant').text('⚠️')
        $('#replaceDesiccant').removeClass('opacity-50');
    })
    .done(function(json) {
        // We only have one feeder - it will always be last!
        for (var k in json.feeders) {
            feeder = json.feeders[k];
        }
        $('#feederInfo').text(' { "sn": "' + feeder.data.sn + '", "firmware": "' + feeder.data.firmware + '" }')
        $('#nextFeeding').text(feeder.data.desc.slice(-5));
        $('#replaceDesiccant').text(feeder.data.state.desiccantLeftDays + " days")
    })
    .always(function() {
        $('.spinner-border').remove();
        console.log("Finished loading PetKit data");
    });
}

function feedKitty(size) {
    // Disable buttons to avoid overfeeding
    $('#btnSmallSnack').prop('disabled', true);
    $('#btnBigSnack').prop('disabled', true);
    $.ajax({
      url: "feed-kitty",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ size: size, feeder: feeder.id })})
    .fail(function(jqXHR, textStatus) {
        console.log("Status: " + textStatus);
    })
    .done(function(data) {
        // Re-enable the buttons after ten seconds
        $('#btnSmallSnack').prop('disabled', false).delay(10000);
        $('#btnBigSnack').prop('disabled', false).delay(10000);
	r = data
    })
    .always(function() {
        console.log("Finished feeding kitty a " + size + " snack");
    });
}

function resetDesiccant() {
    $('#btnResetDesiccant').off('click');
    $('#replaceDesiccant').text('');
    $('#replaceDesiccant').append(
        '<div class="spinner-border spinner-border-sm" role="status">' +
        '  <span class="visually-hidden">Loading...</span>' +
        '</div>')
    $.ajax({
      url: "reset-desiccant",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ feeder: feeder.id })})
    .fail(function(jqXHR, textStatus) {
        console.log("Status: " + textStatus);
        $('#replaceDesiccant').text('⚠️')
        $('#replaceDesiccant').removeClass('opacity-50');
    })
    .done(function(data) {
        console.log("Reset desiccant timer");
        $('#replaceDesiccant').text('✅');
        $('#replaceDesiccant').removeClass('opacity-50');
	r = data
    });
}

loadPetKitData();

$('#btnSmallSnack').on('click', (function() {
  feedKitty("small");
}));
$('#btnBigSnack').on('click', (function() {
  feedKitty("big");
}));
$('#btnResetDesiccant').on('click', (function() {
  resetDesiccant();
}));
