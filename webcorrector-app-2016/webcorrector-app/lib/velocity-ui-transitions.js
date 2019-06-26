var velocity = require("velocity-animate");
require("velocity-ui-pack");

velocity.RegisterUI("transition.newBoxIn", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.4 ], scaleY: [ 1, 0.4 ], translateZ: 0, translateX: [ 0, -400 ]
		}, 1 , { easing: "easeOutCirc" }]
	]
});

velocity.RegisterUI("transition.boxIn", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.4 ], scaleY: [ 1, 0.4 ]
		}, 1 , { easing: "easeOutCirc" }]
	]
});


velocity.RegisterUI("transition.boxOut", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 0.4, 1 ], scaleY: [ 0.4, 1]
		}, 1 , { easing: "easeOutCirc" }]
	]
});

module.exports = velocity;
