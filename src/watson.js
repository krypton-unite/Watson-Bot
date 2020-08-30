/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Example usage of some features of the Perspective API */
import dotenv from 'dotenv';
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

dotenv.config();

/**
 * Analyze attributes in a block of text
 * @param {string} text - text to analyze
 * @return {json} res - analyzed atttributes
 */
async function analyzeText(text) {
  const assistant = new AssistantV2({
    version: process.env.WATSON_ASSISTANT_V2_VERSION,
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_IAM_AUTHENTICATOR_API_KEY,
    }),
    url: process.env.WATSON_ASSISTANT_V2_URL,
  });

  // assistant.method(params)
  //   .catch(err => {
  //     console.log('error:', err);
  //   });

  assistant.createSession({
    assistantId: process.env.WATSON_ASSISTANT_ID
  })
    .then(res => {
      // console.log(JSON.stringify(res.result, null, 2));
      console.log(res.result.session_id)
      assistant.message({
        assistantId: process.env.WATSON_ASSISTANT_ID,
        sessionId: res.result.session_id,
        input: {
          'message_type': 'text',
          'text': 'Hello'
          }
        })
        .then(res => {
          console.log(JSON.stringify(res.result, null, 2));
        })
        .catch(err => {
          console.log(err);
        });


    })
    .catch(err => {
      console.log(err);
    });



  // const analyzer = new google.commentanalyzer_v1alpha1.Commentanalyzer();

  // This is the format the API expects
  // const requestedAttributes = {};
  // for (const key in attributeThresholds) {
  //   requestedAttributes[key] = {};
  // }

  // const req = {
  //   comment: { text: text },
  //   languages: ['pt'],
  //   requestedAttributes: requestedAttributes,
  // };

  // const res = await analyzer.comments.analyze({
  //   key: process.env.PERSPECTIVE_API_KEY,
  //   resource: req
  // });

  // let data = {};

  // for (const key in res['data']['attributeScores']) {
  //   data[key] =
  //     res['data']['attributeScores'][key]['summaryScore']['value'] >
  //     attributeThresholds[key];
  // }
  // return data;
  return text;
}

export default analyzeText;
