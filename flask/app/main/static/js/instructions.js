////////////////////////////////
// INSTRUCTION SLIDE BEHAVIOUR
// //////////////////////////////

var root_address = '/'; // '/experiments/flaskdemo/'; //TODO tie to debug?

$('#ins2').hide(); //Initially hide later slide(s)
$('#comprehension').hide();//and comprehension slide

//Step through slides (currently manual but could list and loop through if many pages)
$('#ins1btn').click(function () {
	$('#ins1').hide();
	$('#ins2').show();
});

$('#ins2btn').click(function () {
	$('#ins2').hide();
	$('#comprehension').show();
});

////////////////////////////////
//COMPREHENSION SLIDE BEHAVIOUR
////////////////////////////////

//Initially block both the check button and the start button
$('#done_comp').prop('disabled', true);
$('#comp_check_btn').prop('disabled', true);

//Listen for actions on radio buttons for when all questions answered
$('.comp_questions').change(function() {
	comp_change_checker();
});

//Answer checker function
$('#comp_check_btn').click(function () { 
	comp_checker();
});


//Checks whether all questions were answered
var comp_change_checker = function() {
	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();//Add more as needed

	//Make sure start button is disabled because the answers haven't been checked
	$('#done_comp').prop('disabled', true);

 	//Only release the check button if there is a response on all questions
	if (q1 === 'noresp' || q2 === 'noresp')
	{
		$('#comp_check_btn').prop('disabled', true);
	} else {
		$('#comp_check_btn').prop('disabled', false);
	}
};

//Check whether all answers are correct
var comp_checker = function() {

	//Pull the selected values
	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();

   //Add the correct answers here
   answers = ["true","5"];

   if(q1 == answers[0] && q2 == answers[1]){
   		//Allow the start
        alert('You got everything correct! Press "Start" to begin the experiment.');
        $('#done_comp').prop('disabled', false);
        $('#comp_check_btn').prop('disabled', true);
    } else {
    	//Throw them back to the start of the instructions
    	//Remove their answers and have them go through again
		alert('You answered at least one question incorrectly! Please try again.');

    	$('#comp_q1').prop('selectedIndex', 0);
    	$('#comp_q2').prop('selectedIndex', 0);
    	$('#done_comp').prop('disabled', true);
    	$('#comp_check_btn').prop('disabled', false);
    	$('#ins1').show();
		$('#comprehension').hide();
    };
}


var goto_task_phase = function(tp)
{
	$('#instructions').hide();
	$('#main_task').hide();
	$('#debrief').hide();

	if (tp=='instructions') {
		$('#instructions').show();
	} else if (tp=='main_task') {
		$('#main_task').show();
	} else if (tp=='debrief') {
		$('#debrief').show();
	} else {
		console.log('not an available phase label', tp);
	}
}

//Start the main task function (just causes a refresh)
$('#done_comp').click(function () {
	console.log('STARTING TASK');
	goto_task_phase('main_task');
});

// Hide the main task and posttest
goto_task_phase('instructions');