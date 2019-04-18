// Continue buttons
console.log('Reached instructions');
$('#ins2').hide();

$('#ins1btn').click(function () {
	$('#ins1').hide();
	$('#ins2').show();
});

$('#ins2btn').click(function () {
	console.log('attempted start task with click');
	window.location = '/';
});