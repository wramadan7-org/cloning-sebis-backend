function onSuccess(googleUser) {
	const profile = googleUser.getBasicProfile();
	var loc = '<%= locationID %>';
	
	loc	+= '/' + profile.getEmail();
	loc += '/' + googleUser.getAuthResponse().id_token;
	loc += '/' + profile.getName();
		
	//alert.message('Logged in as: ' + googleUser.getBasicProfile().getName());
	console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
	location.replace(loc);
}
function onFailure(error) {
	alert.message(error);
	console.log(error);
}
function renderButton() {
	gapi.signin2.render('my-signin2', {
		'scope': 'profile email',
		'height': 50,
		'width' : 320,
		'longtitle': true,
		'theme': 'dark',
		'onsuccess': onSuccess,
		'onfailure': onFailure
	});
}