'use strict';

let github = require('octonode');
let fetch = require('node-fetch');
let base64 = require('base-64');

module.exports.handler = (event, context, callback) => {
    let body = JSON.parse(event.body);
    if (!body || !body.hasOwnProperty('pull_request')) {
        const response = {
            statusCode: 400
        };

        callback(null, response);
        return;
    }

    let headers = new fetch.Headers();
    headers.append('Accept', 'application/vnd.github.diff');
    headers.append('Authorization', 'Basic ' + base64.encode(":" + process.env['GITHUB_TOKEN']));

    let promise = fetch('https://api.github.com/repos/' + body.repository.full_name + '/commits/' + body.pull_request.merge_commit_sha, {
        method: 'GET',
        headers: headers,
    });

    promise
        .then(response => response.text())
        .then(patch => {
            let payload = {
                state: 'success',
                description: 'yay tests!',
                context: 'qa/php-tests'
            };

            if (!patch.includes('assert')) {
                payload.state = 'failure';
                payload.description = 'no test assertions found';
            }

            let client = github.client(process.env['GITHUB_TOKEN']);
            client.post('/repos/' + body.repository.full_name + '/statuses/' + body.pull_request.head.sha, payload, function (err, status, body, headers) {
                const response = {
                    statusCode: 200,
                };

                callback(null, response);
            });
        });
};
