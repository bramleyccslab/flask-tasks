console.log('hello world, main task');

var trials =  [0,9,1,8,2,8,3,7,4,6,5];//temp
var colours = ['#d30023', '#1ca19a', '#f77612', '#437104', '#1d72a0', '#19ee0a', '#11edf4', '#d20101', '#86aa06', '#290a72'];
var sizes = [10,20,30,40,50,60,70,80,90,100];
var trial = 0;
var response = [];
var score = [];

$('#trial_counter').text('Question ' + (trial+1) + ' of ' + colours.length);

$('#drawing').attr({fill: colours[trials[trial]],
					r:sizes[trials[trial]]});


$('#task_l_btn').click(function () {
	response[trial] = 'N';
	score[trial] = 0;
});

$('#task_r_btn').click(function () {
	response[trial] = 'Y';
	score[trial] = 1;
});

$('.response_btns').click(function () {
	
	if (trial<trials.length)
	{
		trial++;
		$('#drawing').attr({fill: colours[trials[trial]],
						r:sizes[trials[trial]]});
		$('#trial_counter').text('Question ' + (trial+1) + ' of ' + colours.length);
	} else{
		console.log('FINISHED TASK');
		window.location = '/';
	}	
	
});

// var test = {{testvar}}; //DIDN'T WORK
// console.log(test);

//Start the main task function (just causes a refresh)
// $('#done_comp').click(function () {
// 	console.log('STARTING TASK');
// 	window.location = '/';
// });