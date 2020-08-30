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
import AssistantV2 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';

dotenv.config();

const instantiate_assistant = () => {
  return new AssistantV2({
    version: process.env.WATSON_ASSISTANT_V2_VERSION,
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_IAM_AUTHENTICATOR_API_KEY,
    }),
    url: process.env.WATSON_ASSISTANT_V2_URL,
  });
};

const instantiate_session = async (assistant) => {
  const session = await assistant.createSession({
    assistantId: process.env.WATSON_ASSISTANT_ID
  })
  return session.result.session_id;
};

const process_message = (assistant, session_id, message) => {
  return assistant.message({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: session_id,
    input: {
      'message_type': 'text',
      'text': message
    }
  }).result;  
}

/**
 * Analyze attributes in a block of text
 * @param {string} text - text to analyze
 * @return {json} res - analyzed atttributes
 */
async function analyzeText(text) {
  const assistant = instantiate_assistant();
  const session_id = await instantiate_session(assistant);
  return await process_message(assistant, session_id, text);
}

export default analyzeText;
export {instantiate_assistant, instantiate_session, process_message};
