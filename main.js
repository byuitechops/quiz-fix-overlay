/*eslint-env node, es6*/

/* Module Description */

/* Put dependencies here */


module.exports = (course, stepCallback) => {
    /* Create the module report so that we can access it later as needed.
    This MUST be done at the beginning of each child module. */
    course.addModuleReport('moduleName');

    /* Used to log successful actions */
    course.success('moduleName', 'moduleName successfully ...');

    /* How to report an error (Replace "moduleName") */
    course.throwErr('moduleName', e);
    /* You should never call the stepCallback with an error. We want the
    whole program to run when testing so we can catch all existing errors */

    stepCallback(null, course);
    /* DO NOT call the callback on an error - instead, continue
    with your child module's process */
};
