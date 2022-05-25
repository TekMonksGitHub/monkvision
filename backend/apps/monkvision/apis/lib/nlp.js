/**
 * NLP Model and Predictions
 *  
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */

const fs = require("fs");
const Mustache = require("mustache");
const utils = require(`${APP_CONSTANTS.LIB_DIR}/nlp/utils.js`);
const tf = require("@tensorflow/tfjs");
const use = require("@tensorflow-models/universal-sentence-encoder");
require('@tensorflow/tfjs-node');

// Load the englishModel
const englishModel = require(`${APP_CONSTANTS.CONF_DIR}/englishModel.json`);

// Global declarations
const MODELS = {}, TENSORS = {}, INTENTS = {}, METRICS = Object.assign({}, englishModel.metrics), 
    DURATIONS = Object.assign({}, englishModel.durations), RESOURCES = Object.assign({}, englishModel.resources);

// Train Model (JSON)
INTENTS["metrics"] = JSON.parse(Mustache.render(fs.readFileSync(`${APP_CONSTANTS.CONF_DIR}/models/metric_intents.json`, "utf8"), englishModel));
INTENTS["durations"] = JSON.parse(Mustache.render(fs.readFileSync(`${APP_CONSTANTS.CONF_DIR}/models/duration_intents.json`, "utf8"), englishModel));
INTENTS["resources"] = JSON.parse(Mustache.render(fs.readFileSync(`${APP_CONSTANTS.CONF_DIR}/models/resource_intents.json`, "utf8"), englishModel));

exports.init = async () => {
    MODELS["encoder"] = use.load();
    _setInputTensor();      // Set input tensors for all the intents

    _createModelAndItsLayer("metrics", 3, englishModel.metrics.length, 200, _trainModel);
    _createModelAndItsLayer("durations", 3, englishModel.durations.length, 250, _trainModel);
    _createModelAndItsLayer("resources", 3, englishModel.resources.length, 200, _trainModel);
}

/** 
 * Create the intents model and train the dataset
 * @param {string} modelName - Intent Model name
 * @param {number} layersCount - Layers to be added to the current Model
 * @param {number} inputShape - Assign Input Shape to the Model
 * @param {number} iterationCount - Model dataset training based on iteration count
 * @param {function} callback - After Create and Train the model with Intents(json)
 */
function _createModelAndItsLayer(modelName, layersCount, inputShape, iterationCount, callback) {
    MODELS[modelName] = tf.sequential();
    for (let layer = 1; layer <= layersCount; layer++) {
        MODELS[modelName].add(tf.layers.dense({
            inputShape: [layer == 1 ? 512 : inputShape],
            activation: 'sigmoid',
            units: inputShape,
        }));
    }

    MODELS[modelName].compile({
        loss: 'meanSquaredError',
        optimizer: tf.train.adam(.06), // This is a standard compile config
    });
    if (callback) callback(modelName, iterationCount);
}

/**
 * Encode sentence to tensor (string -> vector)
 * @param {array} data - training data
 * @returns - encoded data
 */
const encodeData = data => {
    const sentences = data.map(comment => comment.text.toLowerCase());
    const trainingData = MODELS["encoder"].then(model => {
        return model.embed(sentences)
            .then(embeddings => { return embeddings; });
    })
        .catch(err => console.error('Fit Error:', err));
    return trainingData
};

/**
 * Set Input Tensor for the intents
 */
function _setInputTensor() {
    // metrics - cpu, ram, disk
    TENSORS["metrics"] = tf.tensor2d(INTENTS["metrics"].map(metric => englishModel.metrics.map(intent => metric.intent === intent ? 1 : 0)));

    // duration - hours, minutes, seconds, days, weeks, months, years
    TENSORS["durations"] = tf.tensor2d(INTENTS["durations"].map(duration => englishModel.durations.map(intent => duration.intent === intent ? 1 : 0)));

    // resources - primary_prod, secondary_prod, staging, dev
    TENSORS["resources"] = tf.tensor2d(INTENTS["resources"].map(resource => englishModel.resources.map(intent => resource.intent === intent ? 1 : 0)));
}

/**
 * Train the model based on the intents
 * @param {string} modelName - Intent Model name
 * @param {number} iteration - Model dataset training based on iteration count
 */
async function _trainModel(modelName, iteration = 200) {
    const trainingData = encodeData(INTENTS[modelName]).then((data) => { return data });
    await MODELS[modelName].fit(await trainingData, TENSORS[modelName], { epochs: iteration });
}

/**
 * Predict the intents from query
 * @param {object} query - Object contains the sentence to predict the intents
 * @returns - returns predict intents as an Object
 */
exports.predictIntents = async (query) => {
    const sentence = query["text"],
        merticsIntent = await getMetricsIntent(sentence),
        durationIntent = await getDurationIntent(sentence),
        resourceIntent = utils.resourceExists(sentence).length ? await getResourceIntent(sentence) : "null";

    return {
        metric: merticsIntent, duration: durationIntent.weight,
        durationUnit: durationIntent.unit, resourceName: resourceIntent
    }
}

/**
 * Predict Metrics Intent
 * @param {string} query - Plain english sentence
 * @param {Object} metrics - Push mactched intents from sentence
 * @returns - returns metrics intent
 */
async function getMetricsIntent(query, metrics = []) {
    const encodedQuery = encodeData([{ text: query }]).then((data) => { return data }),
        metricPredictions = await MODELS["metrics"].predict(await encodedQuery).array(),
        maxMetricPredict = METRICS[metricPredictions[0].indexOf(Math.max(...metricPredictions[0]))];
    
    if (!utils.intentExists(query, maxMetricPredict)) return metrics;
    query = query.replace(maxMetricPredict, "");
    metrics.push(maxMetricPredict);
    return await getMetricsIntent(query, metrics);
}

/**
 * Predict Durations Intent
 * @param {string} query - Plain english sentence
 * @param {Object} durations - Push mactched intents from sentence
 * @returns - returns durations intent
 */
async function getDurationIntent(query, durations = {}) {
    const encodedQuery = encodeData([{ text: query }]).then((data) => { return data }),
        durationPredictions = await MODELS["durations"].predict(await encodedQuery).array(),
        maxDurationPredict = DURATIONS[durationPredictions[0].indexOf(Math.max(...durationPredictions[0]))],
        strMatch = utils.getDurationUnit(query, maxDurationPredict);

    if (strMatch.length == 0) {
        if (Object.keys(durations).length > 1) return utils.calculateDurationInMinutes(durations);
        durations.unit = Object.keys(durations)[0];
        durations.weight = Object.values(durations)[0];
        return utils.calculateDurationInMinutes(durations);
    }
    const durationWeight = utils.getDurationWeight(query, maxDurationPredict);
    if (durationWeight.startWord) {
        const substr = query.substring(query.indexOf(durationWeight.startWord), query.indexOf(strMatch[0]));
        query = query.replace(substr + strMatch[0], "");
        durations[maxDurationPredict] = durationWeight.base + durationWeight.digits;
    } else {
        query = query.replace(durationWeight + " " + strMatch[0], "");
        durations[maxDurationPredict] = durationWeight;
    }
    return await getDurationIntent(query, durations);
}

/**
 * Predict Resources Intent
 * @param {string} query - Plain english sentence
 * @returns returns resources intent
 */
async function getResourceIntent(query) {
    const encodedQuery = encodeData([{ text: query }]).then((data) => { return data }),
        resourcePredictions = await MODELS["resources"].predict(await encodedQuery).array();
    
    return RESOURCES[resourcePredictions[0].indexOf(Math.max(...resourcePredictions[0]))];
}

exports.model = MODELS;