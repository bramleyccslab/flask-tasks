////////////////////////////////////////
// Governs behaviour of instructions
// and main task and progression through
// //////////////////////////////////////
var trial = 0;
var trials = _.shuffle([0,1,2,3,4,5,6,7,8,9]);
var colours = []; //To be populated from stim.json
var sizes = []; //To be populated from stim.json
var responses = []; //Participants responses stored here
var start_time = new Date();
var start_task_time;
var end_time;

//Load stimuli json data
/////////////////////////
fetch("/experiments/flaskdemo/static/json/stim.json")
.then(function(response) {
    return response.json();
  })
.then(function(myJson) {
	console.log(myJson);
	colours = myJson.colours;
	sizes = myJson.sizes;
})
.catch( (error) => console.log(error) );


// MAIN TRIAL BEHAVIOUR
//////////////////////////
var goto_task = function()
{
	$('#instructions').hide();
	$('#debrief').hide();
	$('#main_task').show();
	start_task_time = new Date();
	advance_trial();
}

var goto_debrief = function()
{
	$('#instructions').hide();
	$('#main_task').hide();
	$('#debrief').show();
}

var advance_trial = function() {
	trial++;
	//console.log("executed advance trial", trial);
	if (trial<trials.length)
	{
		$('#drawing').attr({fill: colours[trials[trial]],
			r:sizes[trials[trial]]});
		$('#trial_counter').text('Question ' + trial + ' of ' + colours.length);
	} else if (trial>trials.length) {
		goto_debrief();
	}
}

$('#task_l_btn').click(function () {
	responses.push('N');
});

$('#task_r_btn').click(function () {
	responses.push('Y');
});

$('.response_btns').click(advance_trial);



// INSTRUCTION SLIDE BEHAVIOUR
// Step through slides
// (currently manual but could list
// and loop through if many pages)
$('#ins1btn').click(function () {
	$('#ins1').hide();
	$('#ins2').show();
});

$('#ins2btn').click(function () {
	$('#ins2').hide();
	$('#comprehension').show();
});


// COMPREHENSION SLIDE BEHAVIOUR
// Check whether all answers are correct
var comp_checker = function() {

	//Pull the selected values
	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();

   // Add the correct answers here
   answers = ["true","5"];

   if(q1 == answers[0] && q2 == answers[1]){
   		// Allow the start
        alert('You got everything correct! Press "Start" to begin the experiment.');
        $('#done_comp').show();
        $('#comp_check_btn').hide();
    } else {
    	// Throw them back to the start of the instructions
    	// Remove their answers and have them go through again
		alert('You answered at least one question incorrectly! Please try again.');

    	$('#comp_q1').prop('selectedIndex', 0);
    	$('#comp_q2').prop('selectedIndex', 0);
    	$('#done_comp').hide();
    	$('#comp_check_btn').show();
    	$('#ins1').show();
		$('#comprehension').hide();
    };
}

// Checks whether all questions were answered
var comp_change_checker = function() {
	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();//Add more as needed

	//Make sure start button is disabled because the answers haven't been checked
	$('#done_comp').hide();

 	//Only release the check button if there is a response on all questions
	if (q1 === 'noresp' || q2 === 'noresp')
	{
		$('#comp_check_btn').hide();
	} else {
		$('#comp_check_btn').show();
	}
};

// Start the main task function (just causes a refresh)
$('#done_comp').click(function () {
	console.log('STARTING TASK');
	goto_task();
});

// Listen for actions on radio buttons for when all questions answered
$('.comp_questions').change(function() {
	comp_change_checker();
});

// Answer checker function
$('#comp_check_btn').click(function () { 
	comp_checker();
});





////////////////
// INITIAL VIEW:
////////////////
// Initially block both the check button and the start button
$('#done_comp').hide();//prop('disabled', true);
$('#comp_check_btn').hide();//prop('disabled', true);

$('#instructions').show();
$('#main_task').hide();
$('#debrief').hide();

//END