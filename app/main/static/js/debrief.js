var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. " + 
"This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";


//Listen for all fields being complete
posttest_button_disabler = function () {
	if($("#feedback").val() === '' || $("#age").val() === '' || $("#sex").val() === 'noresp' || $("#engagement").val() === '--' || $("#difficulty").val() === '--') {
		$('#done_debrief').prop('disabled',true);
	} else{
		$('#done_debrief').prop('disabled',false);
	}
}

prompt_resubmit = function() {
	document.body.innerHTML = error_message;
	$("#resubmit").click(resubmit);
};

//Assign the (dis)abler function to all posttestQ class objects
$(".posttestQ").change(function () {
	posttest_button_disabler();
})


// Block enter in age field
$("#ageinput").keydown(function(event){
	if(event.keyCode == 13) {
		event.preventDefault();
		console.log('blocked enter in age field');
		return false;
	}
});



var save_data = function () {
	console.log('FINISHED TASK');

	var end_time = new Date();

	var data = {
		"subjectwise": {
			date:String(end_time.getFullYear()) + '_' +
				String(end_time.getMonth() + 1).padStart(2, '0') + '_' +
				String(end_time.getDate()).padStart(2, '0'),
			time:String(end_time.getHours()).padStart(2, '0') + '_' +
				String(end_time.getMinutes()).padStart(2, '0')+ '_' +
				String(end_time.getSeconds()).padStart(2, '0'),
			age:$("#ageinput").val(),
			gender:$("#sex").val(),
			feedback:$('#feedback').val(),
			instructions_duration:start_task_time - start_time,
			task_duration:end_time - start_task_time,
			engaging:$("#engagement").val(),
			difficult:$("#difficulty").val()},
		"trialwise":{trials, responses},
		}

		console.log(data);

		const submit = document.getElementById("done_debrief");
		const submit_url = submit.getAttribute("data-submit-url");
		fetch(submit_url, {
			method: 'POST',
			body: JSON.stringify(data),
		})
		.then( (response) => {
			console.log(response);
			return response.json()})
		.then( (json) => goto_complete(json.completed_token) )
		.catch( (error) => console.log(error) );
	}


//TODO: Not yet fully tested (stoled from PsiTurk...)
// resubmit = function() {
// 	document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
// 	reprompt = setTimeout(prompt_resubmit, 10000);
	
// 	save_data();
// 	//TODO: ESTABLISH WHAT THE BEHAVIOUR IS IF session.clear is removed from views.py line 139...
// };


// When done is clicked, attempt to save all the data
$('#done_debrief').click(save_data);
