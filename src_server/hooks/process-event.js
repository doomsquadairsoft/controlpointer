// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        console.log(` ++ ima event hook! ${data.type} ${data.device} ${data.captureProgress}`)



        // limit lengths of submitted data
        const device = context.data.device
            .substring(0, 400);
        const type = context.data.type
            .substring(0, 400);
        const controllingTeam = context.data.controllingTeam
            .substring(0, 3);
        const redProgress = context.data.redProgress
            .substring(0, 3);
        const bluProgress = context.data.bluProgress
            .substring(0, 3);

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
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
