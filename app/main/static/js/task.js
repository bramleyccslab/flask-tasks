console.log('hello world, main task');

var trials =  [0,9,1,8,2,3,7,4,6,5];//temp
var colours = ['#d30023', '#1ca19a', '#f77612', '#437104',
'#1d72a0', '#19ee0a', '#11edf4', '#d20101', '#86aa06', '#290a72'];
var sizes = [10,20,30,40,50,60,70,80,90,100];
var trial = 0;
var responses = [];

$('#trial_counter').text('Question ' + (trial+1) + ' of ' + colours.length);

$('#drawing').attr({fill: colours[trials[trial]],
					r:sizes[trials[trial]]});


$('#task_l_btn').click(function () {
	responses[trial] = 'N';
});

$('#task_r_btn').click(function () {
	responses[trial] = 'Y';
});

$('.response_btns').click(function () {
	trial++;	
	if (trial<trials.length)
	{

		$('#drawing').attr({fill: colours[trials[trial]],
						r:sizes[trials[trial]]});
		$('#trial_counter').text('Question ' + (trial+1) + ' of ' + colours.length);
	} else if (trial==trials.length) {
		$.ajax('/', {
		    type: 'POST',  //??
		    data: {
		    		"trials": 1,
		    		"responses": 2,
		    	  },
		    success: function (data, status, xhr) {
		        console.log('status: ' + status + ', data back: ' +
		         data.completed + ' ' + data.completed_token);
		    },
		    error: function (jqXhr, textStatus, errorMessage) {
		        console.log('Error' + errorMessage);
		    }
		});

	} else if (trial>trials.length) {
		//TODO possibly wrap the second refresh
		////on completion of data instead of using trial counter
		window.location = '/';
	}
	
});

