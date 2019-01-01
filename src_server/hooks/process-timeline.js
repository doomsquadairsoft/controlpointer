// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        console.log('ima timeline hook!')

        const type = context.data.type || 'timeline';
        const action = context.data.action || 'unknown!';
        const source = context.data.source || 'unknown!';
        const target = context.data.target || 'unknown!';
        const targetId = context.data.targetId || 'unknown!';

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            type,
            action,
            source,
            target,
            targetId,
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
