/*eslint-env node, es6*/

/* Module Description */
/* Replaces old quiz overlays with the new quiz dialog (modals) */

/* Put dependencies here */
const canvas = require('canvas-wrapper'),
    cheerio = require('cheerio'),
    asyncLib = require('async');

module.exports = (course, stepCallback) => {

    function getQuestions(quiz, questionCb) {

        function replaceHTML(question, replaceCb) {
            if (/\/\/\s?(?:<|&lt;)!\[CDATA/.test(question.question_text)) {
                /* Remove CDATA (old javascript) */
                question.question_text = question.question_text.replace(/\/\/\s(?:&lt;|<)!\[CDATA\[[\s\S]+\/\/\s\]\](?:&gt;|>)/, '');

                /* Replace old HTML with new HTML */
                var $ = cheerio.load(question.question_text),
                    count = course.getCount(),
                    buttonText = $('p[id*="toggleText"]').prev().text(),
                    boxText = $('p[id*="toggleText"]').text();

                /* Cheerio Magic */
                $('p[id*="toggleText"]').prev().replaceWith(`<div id="dialog_for_link_${count}" title="${buttonText}" class="enhanceable_content dialog">${boxText}</div>`);
                $('p[id*="toggleText"]').replaceWith(`<p><a id="link_${count}" class="Button" href="#dialog_for_link_${count}">${buttonText}</a></p>`);

                /* Apply changes */
                canvas.put(`/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}/questions/${question.id}`, {
                    'quiz_id': quiz.id,
                    'id': question.id,
                    'question[question_text]': $.html()
                }, (err) => {
                    if (err) {
                        // course.error(`Unable to fix the overlay. Quiz: ${quiz.title} questionId${question.id}`);
                        course.error(err);
                        replaceCb(null);
                        return;
                    }
                    course.log('Quiz Overlays Updated', {
                        'Quiz Title': quiz.title,
                        'Quiz ID': quiz.id,
                        'Question ID': question.id,
                        'Question Title': question.question_name
                    });
                    replaceCb(null);
                });
            } else {
                replaceCb(null);
            }
        }

        canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}/questions`, (err, questions) => {
            if (err) {
                course.error(err);
                questionCb(null, course);
                return;
            }
            asyncLib.eachSeries(questions, replaceHTML, () => {
                /* No errs should ever be passed to this point. Otherwise one failed question update will stop all questions from updating */
                questionCb(null);
            });
        });
    }

    /************************************
     * START HERE
     *  Get all quizzes in the course 
     ************************************/
    /* Don't run in online courses */
    var validPlatforms = ['online', 'pathway'];
    if (!validPlatforms.includes(course.settings.platform)) {
        course.message('Invalid platform. Skipping child module');
        stepCallback(null, course);
        return;
    }


    canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
        if (err) {
            course.error(err);
            stepCallback(null, course);
            return;
        }
        /* Process one quiz at a time in an attempt to go easier on the server */
        asyncLib.eachSeries(quizzes, getQuestions, (err) => {
            if (err) {
                // I don't think an err should ever really make it here...
                course.error(err);
            }
            stepCallback(null, course);
        });
    });
};