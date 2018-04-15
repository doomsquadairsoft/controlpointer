// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        console.log(`ima event hook! ${data.type}`)



        // limit length

        const origin = context.data.origin
            .substring(0, 400);



        // ensure a latLng is created
        const type = context.data.type
            .substring(0, 400);

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            origin,
            type,

            // Add the current date
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
