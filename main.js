/*eslint-env node, es6*/

/* Module Description */
/* Replaces */

/* Put dependencies here */
const canvas = require('canvas-wrapper'),
    asyncLib = require('async');


module.exports = (course, stepCallback) => {
    course.addModuleReport('quizFixOverlay');

    function getQuestions(quiz, questionCb) {

        function replaceHTML(question, replaceCb) {
            var overlayHTML = `<div id="dialog_for_link_1" title="Title" class="enhanceable_content dialog">dialog</div><p><a id="${course.getOverlayCount}" class="Button" href="#dialog_for_link_1">prompt</a></p>`;
            

            if (question.question_text.includes('// <![CDATA[')) {
                question.question_text.replace(/\/\/\s<!\[CDATA\[[\s\S]+\/\/\s\]\]>/, '');
                question.question_text.replace(/<p>(?:\s+)?CHECK MY WORK(?:\s+)?<\/p>/i, '');
                canvas.put(`/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}/questions/${question.id}`, {
                    'quiz_id': quiz.id,
                    'id': question.id,
                    'question[question_text]': overlayHTML
                }, (err) => {
                    if (err) {
                        course.throwErr('quizFixOverlay', `Unable to fix the overlay. Quiz: ${quiz.title} questionId${question.id}`);
                        replaceCb(null);
                        return;
                    }
                    course.success('quizFixOverlay', `Updated overlay Quiz: ${quiz.title} questionId${question.id}`);
                    replaceCb(null);
                });
            } else {
                course.success('quizFixOverlay', `CDATA was not found in quiz: ${quiz.title} question: ${question.id}`);
            }
            replaceCb(null);
        }


        canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}`, (err, questions) => {
            if (err) {
                course.throwErr(`quizFixOverlay', 'Could not get quiz Questions from Canvas err: ${err}, quiz: ${quiz.title}`);
                questionCb(null, course);
                return;
            }
            asyncLib.each(questions, replaceHTML, () => {
                /* No errs should ever be passed to this point. Otherwise one failed question update will stop all questions from updating */
                questionCb(null);
            })
        });
    }


    /* Get all quizzes in the course */
    canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
        if (err) {
            course.throwErr(`quizFixOverlay', 'Could not get quizzes from Canvas: ${err}`);
            stepCallback(null, course);
            return;
        }
        asyncLib.each(quizzes, getQuestions, (err) => {
            if (err) {
                // I don't think an err should ever really make it...
            }
            stepCallback(null, course);
        });
    });
};
