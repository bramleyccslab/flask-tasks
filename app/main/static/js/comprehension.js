console.log('hello world, comprehension');

$('.comp_questions').change(function() {
	comp_change_checker();
});

$('#comp_check_btn').click(function () { 
	comp_checker();
});


//checks whether all questions were answered
var comp_change_checker = function() {

	console.log('fired change checker');

	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();

	if (q1 === 'noresp' || q2 === 'noresp')
	{
		$('#done_comp').prop('disabled', true);
	} else {
		$('#done_comp').prop('disabled', false);
	}
};

//checks whether the answers are correct
var comp_checker = function() {
	console.log('comp_checker launched')

	var q1 = $('#comp_q1').val();
	var q2 = $('#comp_q2').val();

   // correct answers 
   answers = ["true","5"];

   if(q1 == answers[0] && q2 == answers[1]){
        // currentview = new TheExperiment();//TestPhase();
        alert('You got everything correct! Press "Start" to begin the experiment.');
        $('#next_comprehend').prop('disabled', false);
    } else {
    	$('#comp_q1').prop('selectedIndex', 0);
    	$('#comp_q2').prop('selectedIndex', 0);
    	$('#next_comprehend').prop('disabled', true);
    	alert('You answered at least one question incorrectly! Please try again.');

        //TODO move back to instructions!!!
    };
}