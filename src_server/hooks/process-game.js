// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        console.log('ima game hook!')


        // ensure a timeRemaining is created
        const remainingGameTime = context.data.remainingGameTime || 355000; // 5 minutes and 55 seconds

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            remainingGameTime,
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
