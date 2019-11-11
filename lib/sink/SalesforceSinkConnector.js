"use strict";

const { SinkConnector } = require("kafka-connect");
const jsforce = require('jsforce');

class SalesforceSinkConnector extends SinkConnector {

    start(properties, callback) {

        this.properties = properties;

        const options = {};

        if (this.properties.tokenAuth) {
            options.instanceUrl = this.properties.tokenAuth.instanceUrl;
            options.accessToken = this.properties.tokenAuth.accessToken;
            this.connection = new jsforce.Connection(options);
            return callback();
        }

        if (this.properties.loginUrl) {
            options.loginUrl = this.properties.loginUrl;
        }

        this.connection = new jsforce.Connection(options);

        if (this.properties.bulkPollInterval) {
            this.connection.bulk.pollInterval = this.properties.bulkPollInterval;
        }

        if (this.properties.bulkPollTimeout) {
            this.connection.bulk.pollTimeout = this.properties.bulkPollTimeout;
        }

        this.connection.login(
            this.properties.username,
            this.properties.password,
            callback);
    }

    taskConfigs(maxTasks, callback) {

        const taskConfig = {
            maxTasks,
            connection: this.connection,
            sObject: this.properties.restSink.sObject,
            idProperty: this.properties.restSink.idProperty,
            batchSize: this.properties.restSink.batchSize,
            bulkOptions: this.properties.restSink.bulkOptions,
            bulkCallback: this.properties.restSink.bulkCallback
        };

        callback(null, taskConfig);
    }

    stop() {
        this.connection.logout();
    }
}

module.exports = SalesforceSinkConnector;
