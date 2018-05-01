/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');
const cheerio = require('cheerio');


module.exports = (course, callback) => {
    tap.test('child-template', (test) => {
        //Get all the files that contain quizzes.
        var quizFiles = course.content.filter(file => {
            //Find all the quizzes in the D2L course object
            if (file.name.includes('quiz_d2l')) {
                return file;
            }
        });

        //Filter the quizzes so that we only have the ones that had CDATA in them.
        var filteredQuizzes = quizFiles.filter(quizFile => {
            return quizFile.dom.xml().includes('CDATA');
        });

        //Grab all the question titles from the questions containing CDATA. This returns an array with arrays inside. We only want one.
        var cdataQuestionNames = filteredQuizzes.map(quiz => {
            var $ = cheerio.load(quiz.dom.xml());
            var questionTitles = [];
            $('item').each((i, item) => {
                if (item.attribs.title) {
                    questionTitles[i] = item.attribs.title;
                }
            });
            return questionTitles;
        });

        //Create a new array to flatten cdataQuestionNames
        var newData = [];
        cdataQuestionNames.forEach(questionName => {
            newData = newData.concat(questionName);
        });
        //Set cdataQuestionNames to the flattened array.
        cdataQuestionNames = newData;

        //Get the live canvas quizzes
        canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
            quizzes.forEach(quiz => {
                //For each quiz get its questions
                canvas.get(`/api/v1/courses/${course.info.canvasOU}/quizzes/${quiz.id}/questions`, (err, questions) => {
                    questions.forEach((question) => {
                        //Check each question for errors
                        var questionText = question.question_text;
                        if (questionText.includes('CDATA')) {
                            tap.fail(`${question.question_name} contains CDATA!`);
                        } else {
                            //Did the current question originally contain CDATA? If not, pass it.
                            if (cdataQuestionNames.includes(question.question_name)) {
                                //Check to see if the old JavaScript was replaced with the new JavaScript
                                if (questionText.includes('class="enhanceable_content dialog"') && questionText.includes('class="Button"')) {
                                    tap.pass();
                                } else {
                                    tap.fail(`Quiz name: '${quiz.title}'. The question: '${question.question_name}' doesn't have the required classes, or doesn't need them.`);
                                }
                            } else {
                                tap.pass();
                            }
                        }
                    });
                });
            });
        });
        test.end();
    });
    callback(null, course);
};