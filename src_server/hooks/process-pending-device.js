// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        const { data } = context;

        console.log('ima hook!')

        // Throw an error if we didn't get a text
        if(!data.did) {
            throw new Error('A device must have an id');
        }

        // The authenticated user
        //const user = context.params.user;
        // The actual message text
        const did = context.data.did
        // ids can't be longer than 400 characters
        .substring(0, 400);

        // ensure a latLng is created
        const latLng = context.data.latLng || [47.62463825220757, -117.17959284771496];

        // Override the original data (so that people can't submit additional stuff)
        context.data = {
            latLng,
            did,
            // Set the user id
            //userId: user._id,
            // Add the current date
            createdAt: new Date().getTime()
        };

        // Best practise, hooks should always return the context
        return context;
    };
};
