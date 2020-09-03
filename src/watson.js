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
import ExtendableError from './ExtendableError';
import moment from 'moment';

class SessionCreationError extends ExtendableError {}
class SessionDeleteError extends ExtendableError {}

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
  const res = await assistant.createSession({
    assistantId: process.env.WATSON_ASSISTANT_ID
  })
  return res;
};

const get_session_details = async (assistant) => {
  const res = await instantiate_session(assistant);
  switch (res.status){
  case 201:
    return {id: res.result.session_id, timestamp: moment()};
  default:
    throw new SessionCreationError("Couldn't create session");
  }
}

const raw_delete_session = async (assistant, session_id) => {
  const res = await assistant.deleteSession({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: session_id,
  })
  return res;
};

const delete_session = async (assistant, session_id) => {
  const res = await raw_delete_session(assistant, session_id);
  if (res.status != 200){
    throw new SessionDeleteError("Couldn't delete session");
  }
}

const process_message = async (assistant, session_id, message) => {
  const res = await assistant.message({
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: session_id,
    input: {
      'message_type': 'text',
      'text': message
    }
  });
  return res.result;  
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
export {instantiate_assistant, instantiate_session, get_session_details, raw_delete_session, delete_session, process_message};
