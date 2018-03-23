'use strict';

let github = require('octonode');
let client = github.client(process.env['GITHUB_TOKEN']);

module.exports.pr_title = (event, context, callback) => {
    let body = JSON.parse(event.body);
    console.log(event.body);

    if (!body || !body.hasOwnProperty('pull_request')) {
        const response = {
            statusCode: 400
        };

        callback(null, response);
        return;
    }

    let payload = {
        state: 'success',
        description: 'PR title according to format',
        context: 'egeniq/qa'
    };

    if (!/^[A-Z]+\-[0-9]+/.test(body.pull_request.title)) {
        payload.state = 'failure';
        payload.description = 'PR title should start with a ticket number';
    }

    client.post('/repos/' + body.repository.full_name + '/statuses/' + body.pull_request.head.sha, payload, function (err, status, body, headers) {
        console.log(err);
        console.log(body);
        const response = {
            statusCode: 200,
        };

        callback(null, response);
    });
};
