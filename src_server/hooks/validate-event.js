// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        // set defaults if the submitted data was empty
        var device = context.data.device || '';
        var type = context.data.type || '';
        var controllingTeam = context.data.controllingTeam || '';
        var redProgress = context.data.redProgress || '';
        var bluProgress = context.data.bluProgress || '';
        var order = context.data.order || '';

        // limit lengths of submitted data
        device = device.substring(0, 400);
        type = type.substring(0, 400);
        controllingTeam = controllingTeam.substring(0, 3);
        redProgress = redProgress.substring(0, 3);
        bluProgress = bluProgress.substring(0, 3);
        order = order.substring(0, 10);

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            order,
            device,
            type,
            controllingTeam,
            redProgress,
            bluProgress,

            // Add the current date
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
