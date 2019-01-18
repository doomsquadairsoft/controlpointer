// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;
        const gameLength = context.data.gameLength || 305500; // 5 minute 55 seconds
        const captureRate = context.data.captureRate || 5000; // 5 seconds

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            gameLength,
            captureRate,
            createdAt: new Date().getTime(),
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
