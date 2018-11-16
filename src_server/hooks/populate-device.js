// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const { app, method, result, params } = context;

    // Make sure that we always have a list of devices either by wrapping
    // a single device into an array or by getting the `data` from the `find` method result
    const devices = method === 'find' ? result.data : [ result ];
    console.log('teh const')
    console.log(devices)
    console.log(result)

    // // Asynchronously get user object from each devices `userId`
    // // and add it to the device
    // await Promise.all(devices.map(async device => {
    //   // We'll also pass the original `params` to the service call
    //   // so that it has the same information available (e.g. who is requesting it)
    //   const user = await app.service('users').get(device.userId, params);
    //
    //   device.user = user;
    // }));


    // Best practise, hooks should always return the context
    return context;
  };
};
