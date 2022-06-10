/**
 * NLP Model and Predictions
 *  
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */

require('@tensorflow/tfjs-node');
const fs = require("fs");
const Mustache = require("mustache");
const tf = require("@tensorflow/tfjs");
const sentenceEncoder = require("@tensorflow-models/universal-sentence-encoder");
const utils = require(`${APP_CONSTANTS.LIB_DIR}/nlp/utils.js`);

// Load the englishModel
const englishModel = require(`${APP_CONSTANTS.CONF_DIR}/englishModel.json`);

// Global declarations
const MODELS = {}, TENSORS = {}, INTENTS = {}, METRICS = Object.assign({}, englishModel.metrics), 
    DURATIONS = Object.assign({}, englishModel.durations), RESOURCES = Object.assign({}, englishModel.resources);

/**
 * Parse and load the JSON file 
 * @param {string} jsonPath - file path
 */
const _parseAndLoadJSON = jsonPath => JSON.parse(Mustache.render(fs.readFileSync(jsonPath, "utf8"), englishModel));

function initSync() {
    // Train Model (JSON)
    INTENTS["metrics"] = _parseAndLoadJSON(`${APP_CONSTANTS.CONF_DIR}/models/metric_intents.json`);
    INTENTS["durations"] = _parseAndLoadJSON(`${APP_CONSTANTS.CONF_DIR}/models/duration_intents.json`);
    INTENTS["resources"] = _parseAndLoadJSON(`${APP_CONSTANTS.CONF_DIR}/models/resource_intents.json`);

    // Set input tensors for all the intents
    _setInputTensor();

    // Load and train the models with the intents
    _loadAndTrainModel();
}

/** 
 * Create the intents model and train the dataset
 * @param {string} modelName - Intent Model name
 * @param {number} layersCount - Layers to be added to the current Model
 * @param {number} inputShape - Assign Input Shape to the Model
 * @param {number} iterationCount - Model dataset training based on iteration count
 * @param {function} callback - After Create and Train the model with Intents(json)
 */
async function _createModelAndItsLayer(modelName, layersCount, inputShape, iterationCount) {
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

    await _trainModel(modelName, iterationCount);
}

/**
 * Encode sentence to tensor (string -> vector)
 * @param {Object} data - training data
 * @returns - encoded data
 */
async function _encodeData(data) {
    const sentences = data.map(comment => comment.text.toLowerCase()),
        embeddings = await MODELS["encoder"].embed(sentences);
    return embeddings;
};

/**
 * Set Input Tensor for the intents
 */
function _setInputTensor() {
    // metrics - cpu, ram, disk
    TENSORS["metrics"] = _mapIntentsWithTensor2d("metrics");

    // duration - hours, minutes, seconds, days, weeks, months, years
    TENSORS["durations"] = _mapIntentsWithTensor2d("durations");

    // resources - primary_prod, secondary_prod, staging, dev
    TENSORS["resources"] = _mapIntentsWithTensor2d("resources");
}

/**
 * Create Tensor 2d sets with the training intents
 * @param {string} intentName - Name of the Intents
 * @returns 
 */
const _mapIntentsWithTensor2d = intentName => tf.tensor2d(INTENTS[intentName].map(object => englishModel[intentName].map(intent => object.intent === intent ? 1 : 0)));

/**
 * Load and train the model once with the intents
 */
async function _loadAndTrainModel() {
    MODELS["encoder"] = await sentenceEncoder.load();

    _createModelAndItsLayer("metrics", 3, englishModel.metrics.length, 200, _trainModel);
    _createModelAndItsLayer("durations", 3, englishModel.durations.length, 250, _trainModel);
    _createModelAndItsLayer("resources", 3, englishModel.resources.length, 200, _trainModel);
}

/**
 * Train the model based on the intents
 * @param {string} modelName - Intent Model name
 * @param {number} iteration - Model dataset training based on iteration count
 */
async function _trainModel(modelName, iteration = 200) {
    const trainingData = await _encodeData(INTENTS[modelName]);
    await MODELS[modelName].fit(trainingData, TENSORS[modelName], { epochs: iteration });
}

/**
 * Predict the intents from query
 * @param {object} query - Object contains the sentence to predict the intents
 * @returns - returns predict intents as an Object
 */
async function predictIntents(query) {
    const sentence = query["text"],
        merticsIntent = await _getMetricsIntent(sentence),
        durationIntent = await _getDurationIntent(sentence),
        resourceIntent = utils.resourceExists(sentence).length ? await _getResourceIntent(sentence) : "null";

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
async function _getMetricsIntent(query, metrics = []) {
    const encodedQuery = await _encodeData([{ text: query }]),
        metricPredictions = await MODELS["metrics"].predict(encodedQuery).array(),
        maxMetricPredict = METRICS[metricPredictions[0].indexOf(Math.max(...metricPredictions[0]))];
    
    if (!utils.intentExists(query, maxMetricPredict)) return metrics;
    query = query.replace(maxMetricPredict, "");
    metrics.push(maxMetricPredict);
    return await _getMetricsIntent(query, metrics);
}

/**
 * Predict Durations Intent
 * @param {string} query - Plain english sentence
 * @param {Object} durations - Push mactched intents from sentence
 * @returns - returns durations intent
 */
async function _getDurationIntent(query, durations = {}) {
    const encodedQuery = await _encodeData([{ text: query }]),
        durationPredictions = await MODELS["durations"].predict(encodedQuery).array(),
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
    return await _getDurationIntent(query, durations);
}

/**
 * Predict Resources Intent
 * @param {string} query - Plain english sentence
 * @returns returns resources intent
 */
async function _getResourceIntent(query) {
    const encodedQuery = await _encodeData([{ text: query }]),
        resourcePredictions = await MODELS["resources"].predict(encodedQuery).array();
    
    return RESOURCES[resourcePredictions[0].indexOf(Math.max(...resourcePredictions[0]))];
}

module.exports = { initSync, predictIntents }