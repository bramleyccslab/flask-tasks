// console.log('loaded debrief js');

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


// When done is clicked, attempt to save all the data
$('#done_debrief').click(save_data);

var save_data = function () {
		console.log('FINISHED TASK');

		var data = {
			"subjectwise": {name:'a',surname:'b',age:1,months:2},
			"trialwise": [[1,2],[3,4]],
		}

		fetch(root_address, {
			method: 'POST',
			body: JSON.stringify(data),
		})
		.then( (response) => {return response.json()})
		.then( (json) => console.log(json) )
		.catch( (error) => console.log(error) )
		// .then(window.location = root_address);
}

//TODO: Not yet fully tested (stoled from PsiTurk...)
resubmit = function() {
	document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
	reprompt = setTimeout(prompt_resubmit, 10000);
	
	save_data();
	//TODO: ESTABLISH WHAT THE BEHAVIOUR IS IF session.clear is removed from views.py line 139...
};