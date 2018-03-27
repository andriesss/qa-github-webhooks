'use strict';

let github = require('octonode');
let client = github.client(process.env['GITHUB_TOKEN']);

module.exports.handler = (event, context, callback) => {
    let body = JSON.parse(event.body);
    console.log(event.body);

    if (!body || !body.hasOwnProperty('pull_request')) {
        const response = {
            statusCode: 400
        };

        callback(null, response);
        return;
    }

    if (!body.pull_request.head.ref.includes('feature')) {
        const response = {
            statusCode: 204
        };

        callback(null, response);
        return;
    }

    let payload = {
        state: 'success',
        description: 'PR title according to format',
        context: 'qa/pr-title'
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
